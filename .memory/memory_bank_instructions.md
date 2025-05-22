# Memory Bank Instructions

## Purpose
The Memory Bank serves as a persistent, structured knowledge repository for the PlyDojo project. It helps maintain context across coding sessions and ensures consistent understanding of the project goals, architecture, and progress.

## Core Files
The Memory Bank consists of seven essential files:

1. **projectbrief.md** - Foundation document that defines the project's purpose, goals, and scope
2. **productContext.md** - Explains why the project exists and the problems it solves
3. **memory_bank_instructions.md** - This file; instructions on how to use the Memory Bank
4. **activeContext.md** - Current work focus, recent changes, and next steps
5. **systemPatterns.md** - System architecture, technical decisions, and design patterns
6. **techContext.md** - Technologies used, development setup, and technical constraints
7. **progress.md** - What has been built, what's working, and what's left to implement

## Best Practices

### Regular Updates
- Update the Memory Bank files as the project evolves
- Keep activeContext.md updated at the beginning and end of each coding session
- Record all major decisions in systemPatterns.md
- Track implementation progress in progress.md

### Claude 3.5 Optimization
- Keep individual files under 20KB to ensure they fit within Claude's context window
- Use clear headings and structured formatting to aid parsing
- Focus on high-value information that provides context rather than code duplication
- Use links to reference specific code files rather than copying large code blocks

### Referencing the Memory Bank
- Reference specific Memory Bank files when asking questions to provide context
- For complex queries, explicitly mention which Memory Bank files should be consulted
- Use consistent terminology that matches the Memory Bank documents

## File Maintenance
- Review and update files at least once per sprint/iteration
- Archive outdated information in a structured way
- Keep the most relevant and current information at the top of each file
- Use dates when recording decisions or progress updates

## Integration with Knowledge Graph
- The Memory Bank complements the Knowledge Graph maintained by the Memory server
- Use the Memory Bank for detailed, structured documentation
- Use the Knowledge Graph for entity relationships and higher-level concepts
- Cross-reference between the two when appropriate 