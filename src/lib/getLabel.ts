export function getLabel(inputLabel: string, labels: Array<{label: string, value: string}>): string | undefined {
    if (!inputLabel || !labels || !Array.isArray(labels)) return undefined;
    
    const labelObject = labels.find(role => role.value === inputLabel);
    return labelObject?.label;
  }