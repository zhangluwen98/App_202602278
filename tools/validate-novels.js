import { validateAllNovels } from './validators/novel-validator.js';

try {
    validateAllNovels();
} catch (error) {
    console.error('Validation error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
}
