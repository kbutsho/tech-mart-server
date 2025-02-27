import { z } from 'zod';
import { discountStatus, priceUnit, productStatus } from './product.constant';
import { IPriceUnit, IProductStatus } from './product.interface';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { COUPON_STATUS, COUPON_TYPE, DISCOUNT_STATUS, DISCOUNT_TYPE } from '../../../helpers/enums';

const productZodSchema = z.object({
  body: z.object({
    code: z.string({
      required_error: 'code is required!'
    }).refine((value) => value.trim() !== '', {
      message: `code is required!`,
    }),
    name: z.string({
      required_error: 'name is required!'
    }).refine((value) => value.trim() !== '', {
      message: `name is required!`,
    }),
    title: z.string({
      required_error: 'title is required!'
    }).refine((value) => value.trim() !== '', {
      message: `title is required!`,
    }),
    description: z.string({
      required_error: 'description is required!'
    }).refine((value) => value.trim() !== '', {
      message: `description is required!`,
    }),
    features: z.record(z.any(), {
      required_error: 'features is required!'
    })
      .refine((value) => Object.keys(value).length > 0, {
        message: 'features is required!',
      })
      .refine((value) => {
        for (const key in value) {
          if (key.trim() === '') {
            return false;
          }
          if (typeof value[key] === 'string' && value[key].trim() === '') {
            return false;
          }
          if (typeof value[key] === 'object') {
            if (Object.keys(value[key]).length === 0) {
              return false;
            }
            for (const subKey in value[key]) {
              if (subKey.trim() === '' || value[key][subKey].trim() === '') {
                return false;
              }
            }
          }
        }
        return true;
      }, {
        message: 'make sure to fill in all feature fields!',
      }),
    // featuredPhotos: z.array(z.any(), {
    //   required_error: "featured photo is required!"
    // }).refine((data) => {
    //   if (data.length < 2) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "upload at least 2 photos!");
    //   }
    //   if (data.length > 5) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "photo should not exceed 5!");
    //   }
    //   if (data.some((photo) => typeof (photo) !== 'string')) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "urls should be string!");
    //   }
    //   if (data.some((photo) => photo.trim() === "")) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "photo urls should not be empty!");
    //   }
    //   return true;
    // }),
    featuredPhotos: z
      .array(
        z.string({
          required_error: 'featured photo is required!'
        }).refine(value => value.trim() !== '', {
          message: 'invalid photo url!'
        })
      )
      .refine(value => value.length >= 2 && value.length <= 5, {
        message: 'upload 2 to 5 featured photos!'
      })
      .refine(value => value.length > 0, {
        message: 'Featured photos are required!'
      }),
    brandId: z.string({
      required_error: 'brand id is required!'
    }).refine((value) => value.trim() !== '', {
      message: `brand is required!`,
    }),
    brand: z.string({
      required_error: 'brand is required!'
    }).refine((value) => value.trim() !== '', {
      message: `brand is required!`,
    }),
    categoryId: z.string({
      required_error: 'category id is required!'
    }).refine((value) => value.trim() !== '', {
      message: `category is required!`,
    }),
    category: z.string({
      required_error: 'category is required!'
    }).refine((value) => value.trim() !== '', {
      message: `category is required!`,
    }),
    priceUnit: z.string({
      required_error: 'price unit is required!'
    }).refine((value) => value.trim() !== '', {
      message: `price unit is required!`,
    }),
    // .refine((value) => priceUnit.includes(value as IPriceUnit), {
    //   message: `price unit should be ${priceUnit.join(', ').replace(/,([^,]*)$/, ' or$1')}`,
    // }),
    price: z.number({
      required_error: 'price is required!'
    }),
    quantity: z.number({
      required_error: 'quantity is required!'
    }),
    status: z.string({
      required_error: 'status is required!',
    })
      .refine((value) => value.trim() !== '', {
        message: 'status is required!',
      }),
    // .refine((value) => productStatus.includes(value as IProductStatus), {
    //   message: `Status should be ${productStatus.join(', ').replace(/,([^,]*)$/, ' or$1')}`,
    // }),
    warranty: z.string({
      required_error: 'warranty is required!'
    }).refine((value) => value.trim() !== '', {
      message: `warranty is required!`,
    }),

    discountPrice: z.number().optional(),
    discountCodes: z.array(
      z.object({
        code: z.string({
          required_error: 'discount code is required!'
        }),
        discountId: z.string({
          required_error: 'discount id is required'
        }),
        status: z.enum([DISCOUNT_STATUS.ACTIVE, DISCOUNT_STATUS.END, DISCOUNT_STATUS.INACTIVE]),
        type: z.enum([DISCOUNT_TYPE.FIXED, DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FREE_SHIPPING]),
        amount: z.number({
          required_error: 'discount amount is required!'
        }),
      })
    ).optional(),
    couponCodes: z.array(
      z.object({
        code: z.string({
          required_error: 'discount code is required!'
        }),
        couponCode: z.string({
          required_error: 'discount id is required'
        }),
        status: z.enum([COUPON_STATUS.ACTIVE, DISCOUNT_STATUS.END, DISCOUNT_STATUS.INACTIVE]),
        type: z.enum([COUPON_TYPE.FIXED, DISCOUNT_TYPE.PERCENTAGE, DISCOUNT_TYPE.FREE_SHIPPING]),
        amount: z.number({
          required_error: 'discount amount is required!'
        }),
      })
    ).optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    variant: z.string().optional(),
    reviews: z.array(
      z.object({
        customerId: z.string({
          required_error: 'customer id is required'
        }),
        comment: z.string().optional(),
        rating: z.number({
          required_error: 'rating is required!'
        }),
      })
    ).optional(),
    rating: z.number().optional(),
  })
});

export const ProductValidation = {
  productZodSchema
};
