# EUDI Wallet LinkedIn Article - PlantUML Diagrams

This directory contains PlantUML source files for all technical diagrams in the LinkedIn article series.

## Files

1. **01-architecture-layers.puml** - 4-layer architecture overview with unidirectional dependencies
2. **02-module-dependencies.puml** - Module dependency graph showing core components
3. **03-credential-er-diagram.puml** - Database schema with indexes and query patterns
4. **04-issuance-sequence.puml** - OpenID4VCI credential issuance flow with timing
5. **05-presentation-swimlanes.puml** - OpenID4VP presentation flow with privacy controls
6. **06-security-layers.puml** - Defense-in-depth security architecture
7. **07-compliance-matrix.puml** - Standards compliance matrix with status
8. **08-performance-metrics.puml** - Performance benchmarks for iOS and Android
9. **09-reuse-checklist.puml** - Architecture checklist for implementation teams

## Generating Images

### Online (Quick)

Visit [PlantUML Online Editor](https://www.plantuml.com/plantuml/uml/) and paste the contents of any `.puml` file.

### Local (Recommended for LinkedIn)

```bash
# Install PlantUML (requires Java)
brew install plantuml

# Generate PNG (recommended for LinkedIn posts)
plantuml -tpng 01-architecture-layers.puml

# Generate SVG (for high-quality web embedding)
plantuml -tsvg 01-architecture-layers.puml

# Generate all diagrams at once
plantuml -tpng *.puml
```

### VS Code Extension

Install [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) for live preview and export.

## LinkedIn Image Specifications

- **Format**: PNG or JPG
- **Aspect ratio**: 1.91:1 (recommended for document posts)
- **Max file size**: 10MB
- **Recommended width**: 1200px
- **DPI**: 72-96 for web display

### Export for LinkedIn

```bash
# High-quality PNG for LinkedIn
plantuml -tpng -SDPI=96 -o ../linkedin-images *.puml
```

## Customization

All diagrams use consistent color palette:

- Light Blue (`#E8F4F8`) - Presentation layer
- Medium Blue (`#B8D4E0`) - Business logic layer
- Dark Blue (`#7BA7BC`) - Data layer
- Gray Blue (`#A8B8C0`) - Native layer
- Success Green (`#90EE90`) - Completed items
- Warning Gold (`#FFD700`) - Partial/optional items
- Planned Orange (`#FFA07A`) - Roadmap items

To change colors globally, edit the `!define` directives at the top of each file.

## Integration with Article

Each diagram is referenced in the article with an `[Insert diagram: ...]` marker. When publishing:

1. Generate PNG images from `.puml` files
2. Upload to LinkedIn as document images
3. Ensure captions match the article references
4. Use alt text for accessibility

## License

These diagrams are part of the EUDI Wallet technical documentation and follow the same license as the main project.

## Questions

For technical questions about the diagrams or architecture, contact Hugo KODE.
