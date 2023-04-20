import { Router } from "express";
import fs from "fs";

const router = Router();
let products = [];

// Exportar productos a JSON
const exportProductsToJSON = async(fileName) => {
    const productsJSON = JSON.stringify(products);
    const filePath = "products.json";
    await fs.promises.truncate(filePath, 0);
    try {
        await fs.promises.writeFile(filePath, productsJSON);
        console.log(
            `Products have been successfully added to the file ${fileName}`
        );
    } catch (err) {
        throw new Error(`error writing file ${err}`);
    }
};

// Listado de todos los productos
router.get("/", (req, res) => {
    const limit = parseInt(req.query.limit);
    if (!limit) {
        // Si no hay limite, enviar array completo
        return res.send({ products });
    } else {
        // Si hay limite, cortar array hasta el limite y enviarlo
        const productsLimit = products.slice(0, limit);
        return res.send(productsLimit);
    }
});

// Productos por ID
router.get("/:pid", (req, res) => {
    // Recibir ID del producto
    const productsId = parseInt(req.params.pid);

    // Buscar el ID en el array
    const product = products.find((product) => product.id === productsId);
    if (!product) {
        // Si  no existe el producto, enviar error
        const error = { error: "Product not found" };
        return res.status(404).send(error);
    }
    // Si existe el producto, mostrar el producto con el ID especifico
    res.send(product);
});

//  Generar productos en Postman
router.post("/", async(req, res) => {
    // Propiedades del producto a recibir de Postman
    const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
    } = req.body;

    // Validar de que todas las propiedades obligatorias sean enviadas
    if (!title ||
        !description ||
        !code ||
        !price ||
        !status ||
        !stock ||
        !category
    ) {
        return res.status(400).send("Complete all data before sending");
    }
    // En caso de tener todo en orden, enviar producto al array dentro del archivo JSON
    const newProduct = {
        id: products.length + 1,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
    };
    products.push(newProduct);
    console.log(newProduct);
    res.send({ status: "success" });
    console.log("product successfully added");
    await exportProductsToJSON("products.json");
});

// Actualizar productos
router.put("/:pid", async(req, res) => {
    // Buscar el producto con el ID solicitado
    const product = products.find((p) => p.id === parseInt(req.params.pid));
    if (!product) {
        // Si no se encuentra, enviar mensaje de error
        return res.status(404).send("Product not found");
    }
    // Actualizar los valores del producto. En caso de no modificar todo, solamente enviar la propiedad actualizada
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.code = req.body.code || product.code;
    product.price = req.body.price || product.price;
    product.status = req.body.status || product.status;
    product.stock = req.body.stock || product.stock;
    product.category = req.body.category || product.category;
    product.thumbnails = req.body.thumbnails || product.thumbnails;

    // Actualizar archivo JSON
    try {
        const productsJSON = JSON.stringify(products);
        await fs.promises.writeFile("products.json", productsJSON);
        return res
            .status(200)
            .json({ status: "success", message: "Product upgraded" });
    } catch (err) {
        return res.status(500).send({ error: `error writing file ${err}` });
    }
});

router.delete("/:pid", async(req, res) => {
    // Buscar el producto con el ID solicitado
    const product = products.find((p) => p.id === parseInt(req.params.pid));
    if (!product) {
        // Si no se encuentra, enviar mensaje de error
        return res.status(404).send("Product not found");
    }

    // Modificar el array para eliminar el producto
    products = products.filter(
        (product) => product.id != parseInt(req.params.pid)
    );

    // Actualizar archivo JSON
    try {
        const productsJSON = JSON.stringify(products);
        await fs.promises.writeFile("products.json", productsJSON);
        return res
            .status(200)
            .send({ status: "success", message: "Product deleted" });
    } catch (err) {
        return res.status(500).send({ error: `error writing file ${err}` });
    }
});

export default router;