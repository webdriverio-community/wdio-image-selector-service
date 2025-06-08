# 📸 Image Selector Service

A WebdriverIO service that allows you to locate and click on-screen elements by matching them against a reference image.

Supports both OpenCV-based matching (for high-performance template matching) and a fallback engine using pixelmatch and Jimp.
## ✨ Features

✅ Multiscale template matching (customizable scales)

✅ Configurable confidence threshold

✅ Optional use of OpenCV for faster and more accurate matching

✅ Fallback engine using pixel-level comparison

✅ Auto-detection and selection of available engine

✅ Automated click at match location, adjusted for DPR



## 📦 Installation
To use this service, you need to install the `@u4/opencv4nodejs` package, which is a dependency for image processing as well as the `pngjs`, `pixelmatch`, and `jimp` libraries for fallback functionality. You can install them using npm:
```bash
npm install @u4/opencv4nodejs pngjs pixelmatch jimp
```
If you are using a macOS system, you may also need to install OpenCV via Homebrew:
```bash
brew install opencv
```

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

