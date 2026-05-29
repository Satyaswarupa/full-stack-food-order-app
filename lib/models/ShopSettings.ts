import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IShopSettings extends Document {
  shopName: string
  address: string
  lat: number
  lng: number
  updatedAt: Date
}

const ShopSettingsSchema = new Schema<IShopSettings>({
  shopName: { type: String, default: 'Our Restaurant' },
  address: { type: String, default: '' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, {
  timestamps: true
})

const ShopSettings: Model<IShopSettings> =
  mongoose.models.ShopSettings ||
  mongoose.model<IShopSettings>('ShopSettings', ShopSettingsSchema)

export default ShopSettings

export async function getShopSettings() {
  return ShopSettings.findOne().lean()
}

export async function getOrCreateShopSettings() {
  let settings = await ShopSettings.findOne()
  if (!settings) {
    settings = await ShopSettings.create({
      shopName: 'Our Restaurant',
      address: '',
      lat: 28.6139,
      lng: 77.209,
    })
  }
  return settings
}
