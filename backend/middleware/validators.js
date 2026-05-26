const MOPT_PLATE_REGEX = /^[A-Z]{3}-\d{3,4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_EXPENSE_TYPES = ['Fuel', 'Tolls', 'Maintenance', 'Repairs', 'Other'];

const currentYear = () => new Date().getFullYear();

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function validatePlate(plate) {
  if (!plate || typeof plate !== 'string') return 'La placa es obligatoria';
  if (!MOPT_PLATE_REGEX.test(plate.trim().toUpperCase()))
    return 'Formato de placa inválido según estándar MOPT (ej. ABC-123 o ABC-1234)';
  return null;
}

function validateVehicleYear(year) {
  const y = parseInt(year);
  if (!year || isNaN(y)) return 'El año del vehículo es obligatorio';
  if (y < 1990 || y > currentYear())
    return `El año debe estar entre 1990 y ${currentYear()}`;
  return null;
}

function validateIdNumber(id_number) {
  if (!id_number) return 'La cédula es obligatoria';
  const digits = String(id_number).replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 12)
    return 'La cédula debe tener entre 9 y 12 dígitos (cédula física o DIMEX)';
  if (!/^\d+$/.test(digits))
    return 'La cédula debe contener solo dígitos numéricos';
  return null;
}

function validateDateNotFuture(dateStr, fieldName = 'La fecha') {
  if (!dateStr) return `${fieldName} es obligatoria`;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return `${fieldName} tiene un formato inválido`;
  date.setHours(0, 0, 0, 0);
  if (date > today()) return `${fieldName} no puede ser una fecha futura`;
  return null;
}

function validateDateAfter(laterDate, earlierDate, msg) {
  if (!laterDate || !earlierDate) return null;
  const d1 = new Date(laterDate);
  const d2 = new Date(earlierDate);
  if (d1 <= d2) return msg;
  return null;
}

function validateEmail(email) {
  if (!email) return null; // opcional
  if (!EMAIL_REGEX.test(email))
    return 'El correo electrónico no tiene un formato válido (ej. usuario@dominio.com)';
  return null;
}

function validateClientName(name) {
  if (!name || typeof name !== 'string' || name.trim().length < 3)
    return 'El nombre o razón social es obligatorio y debe tener al menos 3 caracteres';
  return null;
}

function validatePositiveAmount(amount, fieldName = 'El monto') {
  const n = parseFloat(amount);
  if (amount === undefined || amount === null || amount === '')
    return `${fieldName} es obligatorio`;
  if (isNaN(n) || n <= 0)
    return `${fieldName} debe ser un número positivo mayor a 0`;
  return null;
}

function validateExpenseType(type) {
  if (!type) return 'El tipo de gasto es obligatorio';
  if (!VALID_EXPENSE_TYPES.includes(type))
    return `El tipo de gasto debe ser uno de: ${VALID_EXPENSE_TYPES.join(', ')}`;
  return null;
}

function collectErrors(validations) {
  return validations.filter(Boolean);
}

module.exports = {
  validatePlate,
  validateVehicleYear,
  validateIdNumber,
  validateDateNotFuture,
  validateDateAfter,
  validateEmail,
  validateClientName,
  validatePositiveAmount,
  validateExpenseType,
  collectErrors,
  VALID_EXPENSE_TYPES,
};
