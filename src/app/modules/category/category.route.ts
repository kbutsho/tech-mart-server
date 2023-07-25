import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../../../helpers/enums';
const router = express.Router();

router.post('/', validateRequest(CategoryValidation.categoryZodSchema), auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), CategoryController.createCategory);
router.get('/:id', CategoryController.getSingleCategory);
router.patch('/:id', validateRequest(CategoryValidation.categoryZodSchema), auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), CategoryController.updateCategory);
router.delete('/:id', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), CategoryController.deleteCategory)
router.get('/', CategoryController.getAllCategory)

export const CategoryRoutes = router;
