import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'shop',
  title: 'Shop',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Shop Name',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Shop Description',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image of the Shop',
      options: {
        hotspot: true, // <-- Defaults to false
      },
    }),
    defineField({
      name: 'stars',
      type: 'number',
      title: 'Stars',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviews',
      type: 'number',
      title: 'Reviews',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      type: 'object',
      title: 'Address',
      fields: [
        defineField({
          name: 'fullAddress',
          type: 'string',
          title: 'Full Address',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'location',
          type: 'geopoint',
          title: 'Location',
        }),
      ],
    }),
    defineField({
      name: 'type',
      title: 'Category',
      validation: (rule) => rule.required(),
      type: 'reference',
      to: [{type: 'category'}],
    }),
    defineField({
      name: 'products',
      type: 'array',
      title: 'Products',
      of: [{type: 'reference', to: {type: 'product'}}],
    }),
  ],
})
