import client from "./sanity";

let sanityQuery = (query, params) => client.fetch(query, params);

export const getFeaturedShops = () => {
  return sanityQuery(`
    *[_type=="featured"]{
    ...,
    shops[]->{
        ...,
        products[]->{
        ...
        },
        type->{
        name
        }
        }
    }`);
};

export const getCategories = () => {
  return sanityQuery(`
        *[_type == "category"]
        `);
};

export const getFeaturedShopsById = (id) => {
  return sanityQuery(
    `
        *[_type=="featured" && _id == $id]{
    ...,
    shops[]->{
        ...,
        products[]->{
        ...
        },
        type->{
        name
        }
        }
    }
        `,
    { id }
  );
};
