import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IItem extends Document {
  name: string
  description: string
  imageUrl: string
  price: number
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  isEnabled: { type: Boolean, default: true }
}, {
  timestamps: true
})

const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema)

export default Item
