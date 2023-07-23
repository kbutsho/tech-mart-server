import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { Seller } from "../seller/seller.model";
import { Types } from "mongoose";
import { Customer } from "../customer/customer.model";
import { ILogin, ILoginUserResponse, ISignup } from "./auth.interface";
import { USER_ROLE, USER_STATUS } from "../../../helpers/enums";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { Secret } from "jsonwebtoken";
import { ISeller } from "../seller/seller.interface";
import { ICustomer } from "../customer/customer.interface";
import { Admin } from "../admin/admin.model";
import { IAdmin } from "../admin/admin.interface";
import { SuperAdmin } from "../super-admin/super.admin.model";
import { ISuperAdmin } from "../super-admin/super.admin.interface";


const signup = async (data: ISignup): Promise<IUser | null> => {
  const isUserExist: IUser | null = await User.findOne({ email: data.email });
  let userObjectId: Types.ObjectId | null = null;
  if (isUserExist) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "email already exist!")
  }
  if (data.role === USER_ROLE.SELLER) {
    const seller = await Seller.create({
      image: null,
      phone: null,
      firstName: data.firstName,
      lastName: data.lastName
    });
    userObjectId = seller._id;
  }
  else {
    const customer = await Customer.create({
      image: null,
      phone: null,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    userObjectId = customer._id;
  }
  const { firstName, lastName, ...userData } = data;
  const newData: IUser = {
    ...userData,
    userId: userObjectId,
    isAuthService: false,
    status: data.role === USER_ROLE.SELLER ? USER_STATUS.PENDING : USER_STATUS.ACTIVE
  };
  const user = await User.create(newData);
  const result = await User.findById(user._id);
  return result;
}

const login = async (data: ILogin): Promise<ILoginUserResponse> => {
  const isUserExist: IUser | null = await User.findOne({ email: data.email });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not exist!');
  }
  else {
    if (isUserExist.isAuthService) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'user not exist!');
    } else {
      if (isUserExist.password &&
        !(await User.isPasswordMatched(data.password, isUserExist.password))) {
        throw new ApiError(httpStatus.UNAUTHORIZED,
          'password is incorrect!');
      }
      if (isUserExist.status === USER_STATUS.ACTIVE) {
        const { userId, email, role } = isUserExist;
        const accessToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.secret as Secret,
          config.jwt.expires_in as string
        )
        const refreshToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.refresh_secret as Secret,
          config.jwt.refresh_expires_in as string
        )
        return { accessToken, refreshToken }
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED,
          `your account is ${isUserExist.status}! try again later!`)
      }
    }
  }
};

const loginWithGoogle = async (data: ISignup): Promise<ILoginUserResponse> => {
  const isUserExist: IUser | null = await User.findOne({ email: data.email })
  let userObjectId: Types.ObjectId | null = null;
  if (data.isAuthService) {
    if (!isUserExist) {
      if (data.role === USER_ROLE.SELLER) {
        const seller: ISeller = await Seller.create({
          image: null,
          phone: null,
          firstName: data.firstName,
          lastName: data.lastName ? data.lastName : null
        });
        userObjectId = seller._id;
      }
      else {
        const customer: ICustomer = await Customer.create({
          image: null,
          phone: null,
          firstName: data.firstName,
          lastName: data.lastName ? data.lastName : null,
        });
        userObjectId = customer._id;
      }
      const { firstName, lastName, ...userData } = data;
      const newData: IUser = {
        ...userData,
        password: null,
        userId: userObjectId,
        status: data.role === USER_ROLE.SELLER ? USER_STATUS.PENDING : USER_STATUS.ACTIVE
      };
      const user: IUser = await User.create(newData);
      if (user.status === USER_STATUS.ACTIVE) {
        const { userId, email, role } = user;
        const accessToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.secret as Secret,
          config.jwt.expires_in as string
        )
        const refreshToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.refresh_secret as Secret,
          config.jwt.refresh_expires_in as string
        );
        return { accessToken, refreshToken }
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED,
          `your account is ${user.status}! try again later!`);
      }
    }
    if (isUserExist) {
      if (isUserExist.status === USER_STATUS.ACTIVE) {
        if (isUserExist.role === USER_ROLE.SUPER_ADMIN) {
          let getUser: ISuperAdmin | null = await SuperAdmin.findOne({ _id: isUserExist.userId });
          if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
            await SuperAdmin.findOneAndUpdate({ _id: isUserExist.userId },
              { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
          }
        }
        if (isUserExist.role === USER_ROLE.ADMIN) {
          let getUser: IAdmin | null = await Admin.findOne({ _id: isUserExist.userId });
          if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
            await Admin.findOneAndUpdate({ _id: isUserExist.userId },
              { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
          }
        }
        if (isUserExist.role === USER_ROLE.SELLER) {
          let getUser: ISeller | null = await Seller.findOne({ _id: isUserExist.userId });
          if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
            await Seller.findOneAndUpdate({ _id: isUserExist.userId },
              { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
          }
        }
        if (isUserExist.role === USER_ROLE.CUSTOMER) {
          let getUser: ICustomer | null = await Customer.findOne({ _id: isUserExist.userId });
          if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
            await Customer.findOneAndUpdate({ _id: isUserExist.userId },
              { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
          }
        }
        const { userId, email, role } = isUserExist;
        const accessToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.secret as Secret,
          config.jwt.expires_in as string
        );
        const refreshToken = jwtHelpers.createToken(
          { userId, email, role },
          config.jwt.refresh_secret as Secret,
          config.jwt.refresh_expires_in as string
        );
        return { accessToken, refreshToken }
      } else {
        throw new ApiError(httpStatus.UNAUTHORIZED,
          `your account is ${isUserExist.status}! try again later!`);
      }
    }
  } {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "auth service error!")
  }
}

const adminSignup = async (data: ISignup): Promise<IUser | null> => {
  const isUserExist: IUser | null = await User.findOne({ email: data.email });
  let userObjectId: Types.ObjectId | null = null;
  if (isUserExist) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "email already exist!")
  }
  if (data.role === USER_ROLE.SUPER_ADMIN) {
    const superAdmin: ISuperAdmin = await SuperAdmin.create({
      image: null,
      phone: null,
      firstName: data.firstName,
      lastName: data.lastName
    });
    userObjectId = superAdmin._id;
  }
  else {
    const admin: IAdmin = await Admin.create({
      image: null,
      phone: null,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    userObjectId = admin._id;
  }
  const { firstName, lastName, ...userData } = data;
  const newData: IUser = {
    ...userData,
    userId: userObjectId,
    isAuthService: false,
    status: USER_STATUS.PENDING
  };
  const user = await User.create(newData);
  const result = await User.findById(user._id);
  return result;
}

const adminLoginWithGoogle = async (data: ISignup): Promise<ILoginUserResponse> => {
  const isUserExist: IUser | null = await User.findOne({ email: data.email })
  let userObjectId: Types.ObjectId | null = null;
  if (data.isAuthService) {
    if (data.role === USER_ROLE.SUPER_ADMIN || data.role === USER_ROLE.ADMIN) {
      if (!isUserExist) {
        if (data.role === USER_ROLE.ADMIN) {
          const admin: IAdmin = await Admin.create({
            image: null,
            phone: null,
            firstName: data.firstName,
            lastName: data.lastName ? data.lastName : null
          });
          userObjectId = admin._id;
        }
        else {
          const superAdmin: ISuperAdmin = await Customer.create({
            image: null,
            phone: null,
            firstName: data.firstName,
            lastName: data.lastName ? data.lastName : null,
          });
          userObjectId = superAdmin._id;
        }

        const { firstName, lastName, ...userData } = data;
        const newData: IUser = {
          ...userData,
          password: null,
          userId: userObjectId,
          status: USER_STATUS.PENDING
        };
        const user: IUser = await User.create(newData);
        if (user.status === USER_STATUS.ACTIVE) {
          const { userId, email, role } = user;
          const accessToken = jwtHelpers.createToken(
            { userId, email, role },
            config.jwt.secret as Secret,
            config.jwt.expires_in as string
          )
          const refreshToken = jwtHelpers.createToken(
            { userId, email, role },
            config.jwt.refresh_secret as Secret,
            config.jwt.refresh_expires_in as string
          );
          return { accessToken, refreshToken }
        } else {
          throw new ApiError(httpStatus.UNAUTHORIZED,
            `your account is ${user.status}! try again later!`);
        }
      }
      if (isUserExist) {
        if (isUserExist.role === USER_ROLE.ADMIN || isUserExist.role === USER_ROLE.SUPER_ADMIN) {
          if (isUserExist.status === USER_STATUS.ACTIVE) {
            if (isUserExist.role === USER_ROLE.SUPER_ADMIN) {
              let getUser: ISuperAdmin | null = await SuperAdmin.findOne({ _id: isUserExist.userId });
              if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
                await SuperAdmin.findOneAndUpdate({ _id: isUserExist.userId },
                  { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
              }
            }
            if (isUserExist.role === USER_ROLE.ADMIN) {
              let getUser: IAdmin | null = await Admin.findOne({ _id: isUserExist.userId });
              if (data.lastName != getUser?.lastName || data.firstName !== getUser?.firstName) {
                await Admin.findOneAndUpdate({ _id: isUserExist.userId },
                  { lastName: data.lastName ? data.lastName : null, firstName: data.firstName })
              }
            }
            const { userId, email, role } = isUserExist;
            const accessToken = jwtHelpers.createToken(
              { userId, email, role },
              config.jwt.secret as Secret,
              config.jwt.expires_in as string
            );
            const refreshToken = jwtHelpers.createToken(
              { userId, email, role },
              config.jwt.refresh_secret as Secret,
              config.jwt.refresh_expires_in as string
            );
            return { accessToken, refreshToken }
          } else {
            throw new ApiError(httpStatus.UNAUTHORIZED,
              `your account is ${isUserExist.status}! try again later!`);
          }
        } else {
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'you are not authorized to login here!')
        }
      }
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "invalid user role!")
    }
  } {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "auth service error!")
  }
}

export const AuthService = {
  signup, login, loginWithGoogle, adminSignup, adminLoginWithGoogle
}
