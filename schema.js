const Joi = require("joi");

// module.exports.listingSchema = Joi.object({
//     listing: Joi.object({
//         title: Joi.string().required(),
        
//         location: Joi.string().required(),   
//         country: Joi.string().required(),
        
//         image: Joi.object().allow("", null).optional(),
//     }).required(),
// });
const imageSchema = Joi.object({
  filename: Joi.string()
    .trim()
    .default("listingimage"),

  url: Joi.string()
    .uri()
    .default("https://images.unsplash.com/photo-1566073771259-6a8506099945")
});

module.exports.listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: imageSchema.optional(),
    category:Joi.string().optional()
});

module.exports.reviewSchema  = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required(),
});