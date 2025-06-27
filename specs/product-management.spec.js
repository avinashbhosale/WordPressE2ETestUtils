import {test, expect} from '@wordpress/e2e-test-utils-playwright'
import { Products } from '../pages/Products';

test("Add a simple product", async({page, admin, requestUtils}) => {

    //Create an object of Products page
    const products = new Products(page);

    //Create a product object with product details to pass as a parameter for CreateProduct() method
    let product = require('../testdata/product-details.json');
    const media = await requestUtils.uploadMedia('./upload/img.jpg');
    product.imageID = media.id;
    console.log(product.imageID);

    //Go to the Admin Page
    await admin.visitAdminPage('/');

    //Go to Add new product page
    await admin.createNewPost({postType: 'product'});

    //Create a new product
    await products.createNewProduct(product);

    //Assertion for successfull product creation
    await expect(page.locator('div.notice-success').first()).toBeVisible();
    await expect(page.locator('div.notice-success').first()).toContainText('Product published. View Product');

    //Visit the shop page of the site
    await page.goto('/shop/')

    //Assertion to verify that product is visible on the shop page
    await expect(page.getByRole('link', { name: product.name, exact: true})).toBeVisible();

});