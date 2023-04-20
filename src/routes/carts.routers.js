import { Router } from "express";
import fs from "fs/promises"

const router = Router();
let carts = [];

(async() => {
    try {
        const data = await fs.readFile("carts.json");
        carts = JSON.parse(data);
    } catch (err) {
        console.log("error loading files in the cart", err);
    }
})();

const exportCartsToJSON = async(fileName) => {
    const cartsJSON = JSON.stringify(carts);
    const filePath = 'carts.json';
    try {
        await fs.truncate(filePath, 0);
        await fs.writeFile(filePath, cartsJSON);
        console.log('Products have been successfully added to the file $ { fileName }');
    } catch (err) {
        throw new Error('error writing file $ { err }');
    }
}

router.post('/', async(req, res) => {
    const newCart = {
        id: carts.length + 1,
        products: []
    };
    carts.push(newCart);
    console.log(newCart);
    res.send({ status: "success", message: "new cart created" });
    await exportCartsToJSON('carts.json');
});

router.get("/:cid", (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = carts.find((cart) => cart.id === cartId);
    if (!cart) {
        const error = { error: 'cart not found' };
        return res.status(404).send(error);
    }
    res.send(cart.products);
});

router.post('/:cid/product/:pid', async(req, res) => {
    const { cid, pid } = req.params;
    const cart = carts.find((cart) => cart.id === parseInt(cid));
    if (!cart) {
        res.status(404).json({ error: "Cart not found" });
    }
    try {
        const cartsJSON = JSON.stringify(carts);
        await fs.writeFile('carts.json', cartsJSON);
        res.status(200).json({ status: "success", message: "Cart upgraded" });
    } catch (err) {
        return res.status(500).send('error: error writing file $ { err }');
    }
});

export default router;