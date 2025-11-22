/**
 * Character data validation schema
 * Use this to validate character objects before adding to database
 */

export const VALID_DIFFICULTIES = ['Easy', 'Normal', 'Hard', 'Deadly'];
export const VALID_SKILL_LEVELS = ['Novice', 'Adept', 'Expert', 'Legendary'];
export const VALID_DAMAGE_TYPES = ['Physical', 'Fire', 'Frost', 'Shock', 'Poison', 'Magic', 'Heal'];

export const characterSchema = {
  id: {
    type: 'number',
    required: true,
    validate: (val) => val > 0 && Number.isInteger(val)
  },
  name: {
    type: 'string',
    required: true,
    validate: (val) => val.length >= 2 && val.length <= 100
  },
  race: {
    type: 'string',
    required: true,
    validate: (val) => val.length >= 2 && val.length <= 50
  },
  level: {
    type: 'number',
    required: true,
    validate: (val) => val >= 1 && val <= 100 && Number.isInteger(val)
  },
  location: {
    type: 'string',
    required: true,
    validate: (val) => val.length >= 2 && val.length <= 200
  },
  faction: {
    type: 'string',
    required: true,
    validate: (val) => val.length >= 2 && val.length <= 100
  },
  difficulty: {
    type: 'string',
    required: true,
    validate: (val) => VALID_DIFFICULTIES.includes(val)
  },
  description: {
    type: 'string',
    required: true,
    validate: (val) => val.length >= 50 && val.length <= 1000
  },
  imagePath: {
    type: 'string',
    required: true,
    validate: (val) => val.length > 0
  },
  modelPath: {
    type: 'string',
    required: true,
    validate: (val) => val.length > 0
  },
  stats: {
    type: 'object',
    required: true,
    schema: {
      health: {
        type: 'number',
        required: true,
        validate: (val) => val >= 0 && val <= 100 && Number.isInteger(val)
      },
      magicka: {
        type: 'number',
        required: true,
        validate: (val) => val >= 0 && val <= 100 && Number.isInteger(val)
      },
      stamina: {
        type: 'number',
        required: true,
        validate: (val) => val >= 0 && val <= 100 && Number.isInteger(val)
      }
    }
  },
  skills: {
    type: 'array',
    required: true,
    validate: (val) => val.length > 0,
    itemSchema: {
      name: {
        type: 'string',
        required: true,
        validate: (val) => val.length >= 2 && val.length <= 100
      },
      level: {
        type: 'string',
        required: true,
        validate: (val) => VALID_SKILL_LEVELS.includes(val)
      }
    }
  },
  combat: {
    type: 'array',
    required: true,
    validate: (val) => val.length > 0,
    itemSchema: {
      name: {
        type: 'string',
        required: true,
        validate: (val) => val.length >= 2 && val.length <= 100
      },
      value: {
        type: 'string|number',
        required: true
      },
      type: {
        type: 'string',
        required: true,
        validate: (val) => VALID_DAMAGE_TYPES.includes(val)
      }
    }
  }
};

/**
 * Validate a character object against schema
 */
export function validateCharacter(character) {
  const errors = [];

  function validateField(obj, schema, path = '') {
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const fullPath = path ? `${path}.${key}` : key;

      // Check required
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${fullPath} is required`);
        continue;
      }

      // Skip if not required and missing
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Check type
      if (rules.type) {
        const types = rules.type.split('|');
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (!types.includes(actualType)) {
          errors.push(`${fullPath} must be type ${rules.type}, got ${actualType}`);
          continue;
        }
      }

      // Custom validation
      if (rules.validate && !rules.validate(value)) {
        errors.push(`${fullPath} failed validation`);
      }

      // Nested object schema
      if (rules.schema && typeof value === 'object' && !Array.isArray(value)) {
        validateField(value, rules.schema, fullPath);
      }

      // Array item schema
      if (rules.itemSchema && Array.isArray(value)) {
        value.forEach((item, index) => {
          validateField(item, rules.itemSchema, `${fullPath}[${index}]`);
        });
      }
    }
  }

  validateField(character, characterSchema);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate multiple characters
 */
export function validateCharacters(characters) {
  if (!Array.isArray(characters)) {
    return {
      valid: false,
      errors: ['Input must be an array']
    };
  }

  const results = characters.map((char, index) => ({
    index,
    ...validateCharacter(char)
  }));

  const allErrors = results.flatMap(r =>
    r.errors.map(err => `Character ${r.index + 1}: ${err}`)
  );

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    results
  };
}

/**
 * Check for duplicate IDs
 */
export function checkDuplicateIds(characters) {
  const ids = characters.map(c => c.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    return {
      hasDuplicates: true,
      duplicates: [...new Set(duplicates)]
    };
  }

  return { hasDuplicates: false, duplicates: [] };
}

/**
 * Sanitize character data
 */
export function sanitizeCharacter(character) {
  return {
    ...character,
    name: character.name.trim(),
    race: character.race.trim(),
    location: character.location.trim(),
    faction: character.faction.trim(),
    description: character.description.trim(),
    skills: character.skills.map(s => ({
      name: s.name.trim(),
      level: s.level.trim()
    })),
    combat: character.combat.map(c => ({
      name: c.name.trim(),
      value: c.value,
      type: c.type.trim()
    }))
  };
}
