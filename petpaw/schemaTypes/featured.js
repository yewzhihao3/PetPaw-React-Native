import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'featured',
  title: 'Featured',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required(),
    },
    {
      name: 'description',
      type: 'string',
      title: 'Description',
      validation: (rule) => rule.required(),
    },
    {
      name: 'shops',
      type: 'array',
      title: 'Shops',
      of: [{type: 'reference', to: {type: 'shop'}}],
    },
  ],
})
