import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAddress {
  _id?: string
  label: string
  mobile: string
  fullAddress: string
  isDefault: boolean
}

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'admin' | 'user'
  addresses: IAddress[]
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  mobile: { type: String, required: true },
  fullAddress: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
})

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  addresses: [AddressSchema]
}, {
  timestamps: true
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
