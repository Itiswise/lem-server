const Product = require("../models/product");

exports.addProduct = function (req, res, next) {
  let { partNumber } = req.body;

  if (!partNumber) {
    return res.status(422).send({
      error: "You must provide part number!",
    });
  }

  partNumber = partNumber.trim();

  Product.findOne({ partNumber }, function (err, existingProduct) {
    if (err) {
      return next(err);
    }

    if (existingProduct) {
      return res.status(422).send({ error: "Product already exists!" });
    }

    const product = new Product({
      partNumber,
      linksToDocs: [],
      linksToRedirs: [],
    });

    product.save(function (err) {
      if (err) {
        return next(err);
      }

      res.json({
        partNumber: product.partNumber,
        linksToDocs: product.linksToDocs,
        linksToRedirs: product.linksToRedirs,
        productId: product._id,
      });
    });
  });
};

exports.addLink = function (req, res, next) {
  let { partNumber, description, fileName } = req.body;

  if (!partNumber | !description | !fileName) {
    return res.status(422).send({
      error: "You must provide part number, link description and file name!",
    });
  }

  partNumber = partNumber.trim();
  description = description.trim();
  fileName = fileName.trim();

  const url = `https://riverdi.sharepoint.com/sites/Produkcja/Shared%20Documents/Instrukcje/${fileName}.pdf`;

  Product.findOne({ partNumber }, function (err, existingProduct) {
    if (err) {
      console.log({ err });
      return next(err);
    }

    if (!existingProduct) {
      return res.status(422).send({ error: "Product does not exist!" });
    }

    existingProduct.linksToDocs.push({ description, url });

    existingProduct.save(function (err) {
      if (err) {
        return next(err);
      }

      res.json({
        partNumber: existingProduct.partNumber,
        linksToDocs: existingProduct.linksToDocs,
        linksToRedirs: existingProduct.linksToRedirs,
        productId: existingProduct._id,
      });
    });
  });
};

exports.addRedirection = function (req, res, next) {
  let { partNumber, _redirection } = req.body;

  if (!partNumber | !_redirection) {
    return res.status(422).send({
      error: "You must provide part number and redirection id!",
    });
  }

  partNumber = partNumber.trim();

  Product.findOne({ partNumber })
    .populate("linksToRedirs")
    .exec(async function (err, existingProduct) {
      if (err) {
        console.log({ err });
        return next(err);
      }

      if (!existingProduct) {
        return res.status(422).send({ error: "Product does not exist!" });
      }

      existingProduct.linksToRedirs.push(_redirection);

      try {
        await existingProduct.save(function (err) {
          if (err) {
            console.log({ err });
            res.status(400).send("Error");
            return next(new Error("save error"));
          }

          res.json({
            partNumber: existingProduct.partNumber,
            linksToDocs: existingProduct.linksToDocs,
            linksToRedirs: existingProduct.linksToRedirs,
            productId: existingProduct._id,
          });
        });
      } catch (error) {
        console.log({ error });
        next(error);
        return;
      }
    });
};

exports.changeProduct = function (req, res, next) {
  let { partNumber, linksToDocs, linksToRedirs } = req.body;

  if (!partNumber | !linksToDocs | !linksToRedirs) {
    return res.status(422).send({
      error: "You must provide part number, link array and redirection array!",
    });
  }

  if (!Array.isArray(linksToDocs) | !Array.isArray(linksToRedirs)) {
    return res.status(422).send({
      error: "linksToDocs and linksToRedirs have to be arrays!",
    });
  }

  partNumber = partNumber.trim();

  Product.findOne({ partNumber }, function (err, existingProduct) {
    if (err) {
      console.log({ err });
      return next(err);
    }

    if (!existingProduct) {
      return res.status(422).send({ error: "Product does not exist!" });
    }

    existingProduct.linksToDocs = linksToDocs;
    existingProduct.linksToRedirs = linksToRedirs;

    existingProduct.save(function (err) {
      if (err) {
        return next(err);
      }

      res.json({
        partNumber: existingProduct.partNumber,
        linksToDocs: existingProduct.linksToDocs,
        linksToRedirs: existingProduct.linksToRedirs,
        productId: existingProduct._id,
      });
    });
  });
};
