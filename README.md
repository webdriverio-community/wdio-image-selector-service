# 📸 ClickByMatchingImageService

A WebdriverIO service that enables clicking on-screen elements by matching them against a reference image.

## ✨ Features

✅ Matches reference images in the current browser screenshot
✅ Supports multiscale matching (parametrizable)
✅ Allows configurable confidence threshold
✅ Performs automated click on the best match found

## 📦 Installation
To use this service, you need to install the `@u4/opencv4nodejs` package, which is a dependency for image processing:
```bash
npm install @u4/opencv4nodejs
```
If you are using a macOS system, you may also need to install OpenCV via Homebrew:
```bash
brew install opencv
```

## 🛠️ Usage

```typescript
await browser.clickByMatchingImage('path/to/reference-image.png');
```

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

