import mongoose from 'mongoose';
import { IGenericErrorMessage } from '../interfaces/error';

const handleCastError = (error: mongoose.Error.CastError) => {
  const errors: IGenericErrorMessage[] = [
    {
      path: error.path,
      message: `invalid id!`,
    },
  ];

  const statusCode = 400;
  return {
    statusCode,
    message: 'invalid id!',
    errorMessages: errors,
  };
};

export default handleCastError;
