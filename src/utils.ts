export const toSafeString = (val: any): string => {
  if (typeof val === 'string') {
    // Check if it's a JSON string
    if (val.trim().startsWith('{') && val.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(val);
        return toSafeString(parsed);
      } catch (e) {
        return val;
      }
    }
    return val;
  }
  
  if (val && typeof val === 'object') {
    // Check for common CMA/Met/ArtIC nested structures
    const target = val.framed || val.unframed || val.standard || val.overall || val.base || val;
    
    if (target.text && typeof target.text === 'string') return target.text;
    if (target.value && typeof target.value === 'string') return target.value;
    if (target.raw && typeof target.raw === 'string') return target.raw;
    if (target.display && typeof target.display === 'string') return target.display;
    
    // Handle width/height numeric objects
    const w = target.width || target.width_inch || target.width_cm;
    const h = target.height || target.height_inch || target.height_cm;
    if (typeof w === 'number' && typeof h === 'number') {
      const unit = target.unit || 'in';
      return `${w} x ${h} ${unit}`;
    }

    if (typeof w === 'number' || typeof h === 'number') {
        const unit = target.unit || 'in';
        return `${w || '?'} x ${h || '?'} ${unit}`;
    }

    // Handle string representation if present
    if (typeof target.dimensions === 'string') return target.dimensions;

    // If it's still an object and we can't find a direct string, try to find ANY string property
    const firstString = Object.values(val).find(v => typeof v === 'string');
    if (firstString) return firstString as string;

    return "Dimensions variable";
  }
  return String(val || '');
};
