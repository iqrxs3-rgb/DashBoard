/**
 * Input Validators
 * استخدم هذه الدوال للتحقق من صحة البيانات
 */

export const validateCommand = (command) => {
  const errors = [];

  // التحقق من الاسم
  if (!command.name || typeof command.name !== 'string') {
    errors.push('Command name is required and must be a string');
  } else if (command.name.trim().length < 3) {
    errors.push('Command name must be at least 3 characters');
  } else if (command.name.length > 32) {
    errors.push('Command name must not exceed 32 characters');
  }

  // التحقق من الوصف
  if (!command.description || typeof command.description !== 'string') {
    errors.push('Command description is required');
  } else if (command.description.trim().length < 5) {
    errors.push('Command description must be at least 5 characters');
  } else if (command.description.length > 100) {
    errors.push('Command description must not exceed 100 characters');
  }

  // التحقق من الاستخدام (اختياري)
  if (command.usage && command.usage.length > 100) {
    errors.push('Usage string must not exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRole = (role) => {
  const errors = [];

  // التحقق من اسم الدور
  if (!role.name || typeof role.name !== 'string') {
    errors.push('Role name is required');
  } else if (role.name.trim().length < 2) {
    errors.push('Role name must be at least 2 characters');
  }

  // التحقق من الأذونات
  if (!Array.isArray(role.permissions)) {
    errors.push('Permissions must be an array');
  } else {
    const validPermissions = [
      'MANAGE_COMMANDS',
      'MANAGE_ROLES',
      'VIEW_LOGS',
      'MANAGE_MEMBERS',
      'ADMINISTRATOR',
      'BAN_MEMBERS',
      'KICK_MEMBERS',
      'MUTE_MEMBERS'
    ];

    const invalidPermissions = role.permissions.filter(
      p => !validPermissions.includes(p)
    );

    if (invalidPermissions.length > 0) {
      errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  // التحقق من اللون (اختياري)
  if (role.color && !/^#[0-9A-F]{6}$/i.test(role.color)) {
    errors.push('Color must be a valid hex color code (e.g., #FF0000)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateGuild = (guild) => {
  const errors = [];

  // التحقق من معرف السيرفر
  if (!guild.guildId || typeof guild.guildId !== 'string') {
    errors.push('Guild ID is required and must be a string');
  }

  // التحقق من البادئة (Prefix)
  if (!guild.prefix || typeof guild.prefix !== 'string') {
    errors.push('Prefix is required');
  } else if (guild.prefix.length > 5) {
    errors.push('Prefix must be 5 characters or less');
  } else if (guild.prefix.length === 0) {
    errors.push('Prefix cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLog = (log) => {
  const errors = [];

  // التحقق من الإجراء
  if (!log.action || typeof log.action !== 'string') {
    errors.push('Action is required');
  }

  // التحقق من المستخدم
  if (!log.user || typeof log.user !== 'string') {
    errors.push('User is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validation Middleware
 * استخدمه في الـ routes
 * 
 * مثال:
 * router.post('/', validateInput(validateCommand), controller.create);
 */
export const validateInput = (validatorFn) => {
  return (req, res, next) => {
    const validation = validatorFn(req.body);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    next();
  };
};

export default {
  validateCommand,
  validateRole,
  validateGuild,
  validateLog,
  validateInput
};