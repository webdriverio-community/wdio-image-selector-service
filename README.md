# 📸 Image Selector Service

A WebdriverIO service that allows you to locate and click on-screen elements by matching them against a reference image.

Supports both OpenCV-based matching (for high-performance template matching) and a fallback engine using pixelmatch and Jimp.

## ✨ Features

✅ Multiscale template matching (customizable scales)

✅ Configurable confidence threshold

✅ **Optional** use of OpenCV for faster and more accurate matching

✅ Fallback engine using pixel-level comparison

✅ Auto-detection and selection of available engine

✅ Automated click at match location, adjusted for DPR



## 📦 Installation
To use this service, you need to install `wdio-visual-click-service`, e.g.:
```bash
npm install wdio-visual-click-service
```

Then add the service to your `wdio.conf.ts`:

```ts
export const config: WebdriverIO.Config = {
  // ...
  services: ['visual-click'],
  // ...
}
```

Once set your `browser` instance will now have an additional command called `clickByMatchingImage`.

### Optional: Enable OpenCV Support
This package uses `pngjs`, `pixelmatch`, and `jimp` for image processing which will be installed by default. If you want to enable OpenCV-based image matching (faster and more accurate), you’ll also need @u4/opencv4nodejs.

On macOS:

```bash
brew install opencv
```

#### Then set environment variables manually and install:
```export OPENCV4NODEJS_DISABLE_AUTOBUILD=1
export OPENCV_INCLUDE_DIR=$(brew --prefix opencv)/include/opencv4
export OPENCV_LIB_DIR=$(brew --prefix opencv)/lib
export OPENCV_BIN_DIR=$(brew --prefix opencv)/bin
npm install 
```
⚠️ If OpenCV is unavailable or fails to build, the service will automatically fall back to the pixelmatch engine.

## 🛠️ Usage

```typescript
await browser.clickByMatchingImage('path/to/reference-image.png');
```

## 🧪 Engines Explained
### 🔍 OpenCV Engine (Preferred)
Uses cv.matchTemplate for fast, grayscale template matching. Works best with clean UI captures and supports scale-based resizing.

### 🔁 Fallback Engine
Uses pixelmatch with Jimp for image diffing. Slower but reliable in environments where OpenCV is unavailable.
## ⚙️ Options

The command supports an optional options object:

| Option      | 	Type    | 	Default                                  | 	Description                                |
|-------------|----------|-------------------------------------------|---------------------------------------------|
| scales	     | number[] | 	[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3] | 	Array of scale factors to try during match |
| confidence	 | number   | 	0.7                                      | 	Minimum confidence (0–1) to consider match |

## 📝 Example: Custom Scales + Confidence

```typescript
await browser.clickByMatchingImage('path/to/reference-image.png', {
    scales: [1.0, 0.8, 0.6],
    confidence: 0.8
});
```

