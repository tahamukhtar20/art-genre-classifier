"""Retrain the Art Genre Classifier, following `Art Genre Classifier.ipynb`.

Same recipe as the notebook: ResNet152 (ImageNet) with the last 30 layers trainable, a 1024-unit
head with L2 and dropout, 300x300 inputs, 2000 images for each of 5 genres, an 80/20 split
(random_state=42), Adam at 1e-4, up to 10 epochs with early stopping on validation accuracy.

Differences, all for running on current TensorFlow without 30 GB of RAM:
- images stream from disk with tf.data instead of being loaded into memory at once;
- augmentation uses Keras layers (rotation, shift, zoom, flip); the notebook's shear has no
  built-in layer and is left out;
- the model is saved as one `.keras` file, plus a checkpoint after every epoch so a stopped
  run can resume.

Usage:
    python train.py --data /path/to/wikiart-gangogh/images --out ./out
"""

import argparse
import json
import os
import random

import numpy as np
import tensorflow as tf
import keras
from keras import layers, regularizers
from keras.applications import ResNet152
from keras.applications.resnet import preprocess_input
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

# Folder names in the dataset, in the network's output order (must match backend/main.py).
CLASSES = ["abstract", "cityscape", "portrait", "landscape", "animal-painting"]
PER_CLASS = 2000
SIZE = 300
BATCH = 32
SEED = 42


def list_images(root):
    paths, labels = [], []
    rng = random.Random(SEED)
    for label, name in enumerate(CLASSES):
        folder = os.path.join(root, name)
        files = sorted(f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".jpeg", ".png")))
        rng.shuffle(files)
        chosen = files[:PER_CLASS]
        paths += [os.path.join(folder, f) for f in chosen]
        labels += [label] * len(chosen)
        print(f"{name}: {len(chosen)} images")
    return np.array(paths), np.array(labels)


def load(path, label):
    img = tf.io.decode_image(tf.io.read_file(path), channels=3, expand_animations=False)
    img = tf.image.resize(img, (SIZE, SIZE))
    return preprocess_input(img), label


def dataset(paths, labels, training):
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))
    if training:
        ds = ds.shuffle(len(paths), seed=SEED)
    ds = ds.map(load, num_parallel_calls=tf.data.AUTOTUNE)
    # A broken file would stop training; skip it, as the notebook did.
    ds = ds.ignore_errors()
    return ds.batch(BATCH).prefetch(tf.data.AUTOTUNE)


def build_model():
    augment = keras.Sequential(
        [
            layers.RandomRotation(20 / 360),
            layers.RandomTranslation(0.2, 0.2),
            layers.RandomZoom(0.2),
            layers.RandomFlip("horizontal"),
        ],
        name="augment",
    )
    base = ResNet152(weights="imagenet", include_top=False, input_shape=(SIZE, SIZE, 3))
    for layer in base.layers:
        layer.trainable = False
    for layer in base.layers[-30:]:
        layer.trainable = True

    inputs = keras.Input((SIZE, SIZE, 3))
    x = augment(inputs)  # only active while training
    x = base(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(1024, activation="relu", kernel_regularizer=regularizers.l2(0.05))(x)
    x = layers.Dropout(0.6)(x)
    outputs = layers.Dense(len(CLASSES), activation="softmax")(x)
    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True, help="folder with one subfolder per genre")
    ap.add_argument("--out", default="out")
    ap.add_argument("--epochs", type=int, default=10)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    keras.utils.set_random_seed(SEED)

    paths, labels = list_images(args.data)
    p_train, p_test, y_train, y_test = train_test_split(paths, labels, test_size=0.2, random_state=SEED)
    train_ds, test_ds = dataset(p_train, y_train, True), dataset(p_test, y_test, False)

    ckpt = os.path.join(args.out, "checkpoint.keras")
    if os.path.exists(ckpt):
        print("Resuming from", ckpt)
        model = keras.models.load_model(ckpt)
        done = json.load(open(os.path.join(args.out, "epochs_done.json")))["epochs"]
    else:
        model, done = build_model(), 0

    class EpochsDone(keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            json.dump({"epochs": epoch + 1}, open(os.path.join(args.out, "epochs_done.json"), "w"))

    history = model.fit(
        train_ds,
        validation_data=test_ds,
        epochs=args.epochs,
        initial_epoch=done,
        callbacks=[
            keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=3, restore_best_weights=True),
            keras.callbacks.ModelCheckpoint(ckpt),
            EpochsDone(),
            keras.callbacks.CSVLogger(os.path.join(args.out, "history.csv"), append=True),
        ],
    )

    loss, acc = model.evaluate(test_ds)
    y_pred = np.argmax(model.predict(test_ds), axis=1)
    y_true = np.concatenate([y.numpy() for _, y in test_ds])
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES))))

    model.save(os.path.join(args.out, "art_genre_classifier.keras"))
    json.dump(
        {
            "classes": CLASSES,
            "test_loss": loss,
            "test_accuracy": acc,
            "history": history.history,
            "confusion_matrix": cm.tolist(),
        },
        open(os.path.join(args.out, "results.json"), "w"),
        indent=2,
    )
    print(f"Test accuracy: {acc:.4f}")


if __name__ == "__main__":
    main()
