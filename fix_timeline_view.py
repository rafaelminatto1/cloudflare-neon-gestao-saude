import re

with open("src/components/TimelineView.tsx", "r") as f:
    content = f.read()

# Replace the condition to match our new category or uppercase equivalent.
# Previously: if (exam.categoria === 'SANGUE') {
# We will use: if (exam.categoria && exam.categoria.toUpperCase() === 'SANGUE') {

content = content.replace("if (exam.categoria === 'SANGUE') {", "if (exam.categoria && exam.categoria.toUpperCase() === 'SANGUE') {")

with open("src/components/TimelineView.tsx", "w") as f:
    f.write(content)

print("TimelineView patched.")
