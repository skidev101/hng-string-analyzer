import { Router } from 'express';
import { 
  createString, 
  getAllStrings,
  getString, 
  filterByNaturalLanguage,
  deleteString 
} from '../controllers/stringController';

const router = Router();

// natural language route come before /:value to avoid conflicts
router.get('/filter-by-natural-language', filterByNaturalLanguage);

// get all strings with optional filters
router.get('/', getAllStrings);

router.post('/', createString);
router.get('/:value', getString);
router.delete('/:value', deleteString);

export default router;