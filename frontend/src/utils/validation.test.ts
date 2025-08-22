/**
 * 表单验证工具测试
 */

import { describe, it, expect } from 'vitest';
import {
  ValidationRules,
  ProjectValidationRules,
  validateField,
  validateForm,
  FormValidator,
  createProjectFormValidator,
  validateProjectData,
  ValidationUtils,
} from './validation';

describe('ValidationRules', () => {
  describe('required', () => {
    it('should return error for empty values', () => {
      const rule = ValidationRules.required();

      expect(rule.validate('')).toBe('此字段不能为空');
      expect(rule.validate('   ')).toBe('此字段不能为空');
      expect(rule.validate(null)).toBe('此字段不能为空');
      expect(rule.validate(undefined)).toBe('此字段不能为空');
    });

    it('should return undefined for valid values', () => {
      const rule = ValidationRules.required();

      expect(rule.validate('test')).toBeUndefined();
      expect(rule.validate('  test  ')).toBeUndefined();
    });

    it('should use custom message', () => {
      const rule = ValidationRules.required('自定义错误信息');

      expect(rule.validate('')).toBe('自定义错误信息');
    });
  });

  describe('minLength', () => {
    it('should return error for short values', () => {
      const rule = ValidationRules.minLength(5);

      expect(rule.validate('test')).toBe('至少需要 5 个字符');
      expect(rule.validate('')).toBe('至少需要 5 个字符');
    });

    it('should return undefined for valid values', () => {
      const rule = ValidationRules.minLength(5);

      expect(rule.validate('testing')).toBeUndefined();
      expect(rule.validate('12345')).toBeUndefined();
    });

    it('should use custom message', () => {
      const rule = ValidationRules.minLength(5, '太短了');

      expect(rule.validate('test')).toBe('太短了');
    });
  });

  describe('maxLength', () => {
    it('should return error for long values', () => {
      const rule = ValidationRules.maxLength(5);

      expect(rule.validate('testing')).toBe('不能超过 5 个字符');
    });

    it('should return undefined for valid values', () => {
      const rule = ValidationRules.maxLength(5);

      expect(rule.validate('test')).toBeUndefined();
      expect(rule.validate('12345')).toBeUndefined();
    });
  });

  describe('pattern', () => {
    it('should return error for invalid pattern', () => {
      const rule = ValidationRules.pattern(/^\d+$/, '只能包含数字');

      expect(rule.validate('abc')).toBe('只能包含数字');
      expect(rule.validate('123abc')).toBe('只能包含数字');
    });

    it('should return undefined for valid pattern', () => {
      const rule = ValidationRules.pattern(/^\d+$/, '只能包含数字');

      expect(rule.validate('123')).toBeUndefined();
    });
  });

  describe('oneOf', () => {
    it('should return error for invalid values', () => {
      const rule = ValidationRules.oneOf(['a', 'b', 'c']);

      expect(rule.validate('d')).toBe('请选择有效的选项');
      expect(rule.validate('x')).toBe('请选择有效的选项');
    });

    it('should return undefined for valid values', () => {
      const rule = ValidationRules.oneOf(['a', 'b', 'c']);

      expect(rule.validate('a')).toBeUndefined();
      expect(rule.validate('b')).toBeUndefined();
      expect(rule.validate('c')).toBeUndefined();
    });
  });

  describe('custom', () => {
    it('should use custom validator function', () => {
      const rule = ValidationRules.custom((value) => {
        return value === 'invalid' ? '自定义错误' : undefined;
      });

      expect(rule.validate('invalid')).toBe('自定义错误');
      expect(rule.validate('valid')).toBeUndefined();
    });
  });
});

describe('ProjectValidationRules', () => {
  describe('projectName', () => {
    it('should validate project name correctly', () => {
      const rules = ProjectValidationRules.projectName;

      // Test empty name
      expect(validateField('', rules).isValid).toBe(false);
      expect(validateField('', rules).error).toBe('项目名称不能为空');

      // Test short name
      expect(validateField('a', rules).isValid).toBe(false);
      expect(validateField('a', rules).error).toBe('项目名称至少需要 2 个字符');

      // Test long name
      const longName = 'a'.repeat(51);
      expect(validateField(longName, rules).isValid).toBe(false);
      expect(validateField(longName, rules).error).toBe(
        '项目名称不能超过 50 个字符'
      );

      // Test invalid characters
      expect(validateField('test@project', rules).isValid).toBe(false);
      expect(validateField('test@project', rules).error).toBe(
        '项目名称只能包含字母、数字、中文、下划线、连字符和空格'
      );

      // Test valid names
      expect(validateField('Test Project', rules).isValid).toBe(true);
      expect(validateField('测试项目', rules).isValid).toBe(true);
      expect(validateField('test_project-1', rules).isValid).toBe(true);
    });
  });

  describe('projectDescription', () => {
    it('should validate project description correctly', () => {
      const rules = ProjectValidationRules.projectDescription;

      // Test empty description (should be valid)
      expect(validateField('', rules).isValid).toBe(true);

      // Test long description
      const longDesc = 'a'.repeat(201);
      expect(validateField(longDesc, rules).isValid).toBe(false);
      expect(validateField(longDesc, rules).error).toBe(
        '项目描述不能超过 200 个字符'
      );

      // Test valid description
      expect(validateField('This is a test project', rules).isValid).toBe(true);
    });
  });

  describe('projectType', () => {
    it('should validate project type correctly', () => {
      const rules = ProjectValidationRules.projectType;

      // Test empty type
      expect(validateField('', rules).isValid).toBe(false);

      // Test invalid type
      expect(validateField('invalid', rules).isValid).toBe(false);

      // Test valid types
      expect(validateField('web', rules).isValid).toBe(true);
      expect(validateField('mobile', rules).isValid).toBe(true);
      expect(validateField('desktop', rules).isValid).toBe(true);
      expect(validateField('api', rules).isValid).toBe(true);
    });
  });

  describe('projectTemplate', () => {
    it('should validate project template correctly', () => {
      const rules = ProjectValidationRules.projectTemplate;

      // Test empty template
      expect(validateField('', rules).isValid).toBe(false);
      expect(validateField('', rules).error).toBe('请选择项目模板');

      // Test valid template
      expect(validateField('react-ts', rules).isValid).toBe(true);
    });
  });
});

describe('validateField', () => {
  it('should validate field with multiple rules', () => {
    const rules = [
      ValidationRules.required(),
      ValidationRules.minLength(3),
      ValidationRules.maxLength(10),
    ];

    // Test empty value
    expect(validateField('', rules).isValid).toBe(false);
    expect(validateField('', rules).error).toBe('此字段不能为空');

    // Test short value
    expect(validateField('ab', rules).isValid).toBe(false);
    expect(validateField('ab', rules).error).toBe('至少需要 3 个字符');

    // Test long value
    expect(validateField('abcdefghijk', rules).isValid).toBe(false);
    expect(validateField('abcdefghijk', rules).error).toBe(
      '不能超过 10 个字符'
    );

    // Test valid value
    expect(validateField('abcdef', rules).isValid).toBe(true);
    expect(validateField('abcdef', rules).error).toBeUndefined();
  });
});

describe('validateForm', () => {
  it('should validate entire form', () => {
    const schema = {
      name: [ValidationRules.required(), ValidationRules.minLength(2)],
      email: [
        ValidationRules.required(),
        ValidationRules.pattern(/^\S+@\S+$/, '无效的邮箱格式'),
      ],
    };

    // Test invalid form
    const invalidData = { name: '', email: 'invalid-email' };
    const invalidResult = validateForm(invalidData, schema);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.name).toBe('此字段不能为空');
    expect(invalidResult.errors.email).toBe('无效的邮箱格式');

    // Test valid form
    const validData = { name: 'John', email: 'john@example.com' };
    const validResult = validateForm(validData, schema);
    expect(validResult.isValid).toBe(true);
    expect(Object.keys(validResult.errors)).toHaveLength(0);
  });
});

describe('FormValidator', () => {
  it('should create validator with schema', () => {
    const schema = {
      name: [ValidationRules.required()],
      age: [ValidationRules.required()],
    };

    const validator = new FormValidator(schema);

    // Test field validation
    expect(validator.validateField('name', '').isValid).toBe(false);
    expect(validator.validateField('name', 'John').isValid).toBe(true);

    // Test form validation
    const result = validator.validateForm({ name: '', age: '25' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('此字段不能为空');

    // Test required field check
    expect(validator.isFieldRequired('name')).toBe(true);
  });
});

describe('createProjectFormValidator', () => {
  it('should create project form validator', () => {
    const validator = createProjectFormValidator();

    const validData = {
      name: 'Test Project',
      description: 'A test project',
      type: 'web',
      template: 'react-ts',
    };

    const result = validator.validateForm(validData);
    expect(result.isValid).toBe(true);

    const invalidData = {
      name: '',
      description: '',
      type: 'invalid',
      template: '',
    };

    const invalidResult = validator.validateForm(invalidData);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.name).toBe('项目名称不能为空');
  });
});

describe('validateProjectData', () => {
  it('should validate project data and throw error for invalid data', () => {
    const invalidData = {
      name: '',
      description: '',
      type: 'web',
      template: 'react-ts',
    };

    expect(() => validateProjectData(invalidData)).toThrow('项目名称不能为空');

    const validData = {
      name: 'Test Project',
      description: 'A test project',
      type: 'web',
      template: 'react-ts',
    };

    expect(() => validateProjectData(validData)).not.toThrow();
  });
});

describe('ValidationUtils', () => {
  describe('isEmpty', () => {
    it('should check if value is empty', () => {
      expect(ValidationUtils.isEmpty('')).toBe(true);
      expect(ValidationUtils.isEmpty('   ')).toBe(true);
      expect(ValidationUtils.isEmpty(null)).toBe(true);
      expect(ValidationUtils.isEmpty(undefined)).toBe(true);
      expect(ValidationUtils.isEmpty('test')).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should validate email format', () => {
      expect(ValidationUtils.isEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isEmail('user.name@domain.co.uk')).toBe(true);
      expect(ValidationUtils.isEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isEmail('test@')).toBe(false);
      expect(ValidationUtils.isEmail('@example.com')).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('should validate URL format', () => {
      expect(ValidationUtils.isUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isUrl('http://localhost:3000')).toBe(true);
      expect(ValidationUtils.isUrl('ftp://files.example.com')).toBe(true);
      expect(ValidationUtils.isUrl('invalid-url')).toBe(false);
      expect(ValidationUtils.isUrl('http://')).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should check if value is a number', () => {
      expect(ValidationUtils.isNumber('123')).toBe(true);
      expect(ValidationUtils.isNumber('123.45')).toBe(true);
      expect(ValidationUtils.isNumber(123)).toBe(true);
      expect(ValidationUtils.isNumber('abc')).toBe(false);
      expect(ValidationUtils.isNumber('')).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('should check if value is an integer', () => {
      expect(ValidationUtils.isInteger('123')).toBe(true);
      expect(ValidationUtils.isInteger(123)).toBe(true);
      expect(ValidationUtils.isInteger('123.45')).toBe(false);
      expect(ValidationUtils.isInteger(123.45)).toBe(false);
      expect(ValidationUtils.isInteger('abc')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should check if value is in range', () => {
      expect(ValidationUtils.isInRange(5, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(1, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(10, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(0, 1, 10)).toBe(false);
      expect(ValidationUtils.isInRange(11, 1, 10)).toBe(false);
    });
  });
});
