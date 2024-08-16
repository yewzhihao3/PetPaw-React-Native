import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {googleMapsInput} from '@sanity/google-maps-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'PetPaw',

  projectId: 'cl0evgzw',
  dataset: 'production',

  plugins: [
    deskTool(),
    visionTool(),
    googleMapsInput({
      apiKey: 'AIzaSyDMk6B-XVLm3y86H7HCNxiJCAR4kUsZ6pM',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
