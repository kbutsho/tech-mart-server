import { IBrandStatus } from './brand.interface';
import { z } from 'zod';
import { brandStatus } from './brand.constant';

const brandZodSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: 'code is required!'
    }).refine((value) => value.trim() !== '', {
      message: `code cannot be empty!`,
    }),
    name: z.string({
      required_error: 'name is required!'
    }).refine((value) => value.trim() !== '', {
      message: `name cannot be empty!`,
    }),
    title: z.string({
      required_error: 'title is required!'
    }).refine((value) => value.trim() !== '', {
      message: `title cannot be empty!`,
    }),
    description: z.string({
      required_error: 'description is required!'
    }).refine((value) => value.trim() !== '', {
      message: `description cannot be empty!`,
    }),
    coverPhoto: z.string({
      required_error: 'cover photo is required!'
    }).refine((value) => value.trim() !== '', {
      message: `cover photo cannot be empty!`,
    }),
    status: z.string({
      required_error: 'status is required!'
    }).refine((value) => brandStatus.includes(value as IBrandStatus), {
      message: `status should be ${brandStatus.join(', ').replace(/,([^,]*)$/, ' or$1')}`,
    })
  })
});

export const BrandValidation = {
  brandZodSchema
};
