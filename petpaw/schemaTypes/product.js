import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Product Name',
      validation: (rule) => rule.required(),
    },
    {
      name: 'description',
      type: 'text',
      title: 'Product Description',
      validation: (rule) => rule.required(),
    },
    {
      name: 'image',
      type: 'image',
      title: 'Image of the Product',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'price',
      type: 'number',
      title: 'Price of the Product in MYR',
      validation: (rule) => rule.required().positive(),
    },
    {
      name: 'stock',
      type: 'number',
      title: 'Available Stock',
      description: 'Number of items available in stock',
      validation: (rule) => rule.required().min(0).integer(),
    },
    {
      name: 'category',
      type: 'reference',
      to: [{type: 'category'}],
      title: 'Product Category',
    },
  ],
})
