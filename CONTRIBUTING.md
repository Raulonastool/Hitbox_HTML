# Contributing to Hitbox

Thank you for your interest in contributing to Hitbox! This is a collaborative explorable artwork, and we welcome all contributions.

## Ways to Contribute

### 🎨 Create Themes
The easiest way to contribute is to create a new visual theme:
1. Copy one of the existing theme objects in `sketch.js`
2. Modify colors and rendering methods
3. Test your theme using the test suite
4. Submit a pull request

See the [README](README.md#creating-your-own-theme) for detailed theme creation guide.

### 🎮 Add Game Features
- New tile types
- New hazards or obstacles
- New biomes
- Power-ups or collectibles
- Gameplay mechanics

### 🧪 Write Tests
Help improve code coverage by writing tests for:
- New features you add
- Existing code that lacks tests
- Edge cases and error conditions

### 📝 Improve Documentation
- Fix typos or unclear explanations
- Add examples
- Create tutorials
- Translate documentation

### 🐛 Report Bugs
Open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/device information

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/Hitbox_HTML.git
cd Hitbox_HTML
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Make Your Changes
- Create a new branch: `git checkout -b feature/my-new-feature`
- Make your changes
- Test locally by opening `index.html` in a browser

### 4. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

### 5. Commit Your Changes
Follow these commit message guidelines:
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Keep first line under 50 characters
- Add details in body if needed

Example:
```
Add watercolor theme with painterly effects

- Soft gradient backgrounds
- Brush stroke tile rendering
- Pastel color palette
- Hand-drawn player character
```

### 6. Push and Create Pull Request
```bash
git push origin feature/my-new-feature
```

Then create a pull request on GitHub with:
- Clear description of what you changed and why
- Reference any related issues
- Screenshots/GIFs if visual changes
- Note if this is a breaking change

## Code Guidelines

### Theme Development
- Implement all required methods
- Include all required colors (deepPurple, purple, cyan, pink)
- Test your theme with the validator
- Ensure it works on mobile and desktop
- Add animations where appropriate

### Game Logic
- Keep game logic separate from rendering
- Add comments for complex logic
- Write tests for new features
- Maintain performance (avoid expensive operations in draw loop)
- Consider mobile performance

### Testing
- Write tests for new features
- Ensure existing tests pass
- Aim for good coverage of critical paths
- Use descriptive test names

## Theme Contribution Checklist

Before submitting a new theme:

- [ ] Theme has a unique, descriptive name
- [ ] All required colors are defined
- [ ] All required methods are implemented
- [ ] Theme passes the theme validator test
- [ ] Tested on desktop browser
- [ ] Tested on mobile device
- [ ] All tile types render correctly
- [ ] Player character is visible and clear
- [ ] HUD is readable
- [ ] D-pad is usable on mobile
- [ ] No console errors
- [ ] Added theme to THEMES array
- [ ] Updated README with theme name/description

## Questions?

- Open an issue for questions
- Check existing issues and pull requests
- Review the [README](README.md) for documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you for helping make Hitbox a beautiful collaborative artwork!** 🎨
