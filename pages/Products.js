export class Products{

    //Constructor
    constructor(page) {
        this.page = page;
    }

    //Method to create a new product
    async createNewProduct(product) {

        //Add Product Name
        await this.page.getByLabel('Product name').fill(product.name);

        //Product Description text area is inside an iframe
        const productDescFrame = await this.page.frameLocator('#content_ifr');
        const productDescription = await productDescFrame.locator('body#tinymce');
        await productDescription.click();
        await productDescription.fill(product.description);

        //Set Product Price
        await this.page.getByRole('textbox', { name: 'Regular price (₹)' }).fill(product.regularPrice);
        await this.page.getByRole('textbox', { name: 'Sale price (₹)' }).fill(product.salePrice);

        //Set Categories and tags
        await this.page.getByRole('link', { name: '+ Add new category' }).click();
        await this.page.getByRole('textbox', { name: 'Add new category' }).fill(product.category);
        await this.page.getByRole('button', { name: 'Add new category' }).click();

        await this.page.getByRole('combobox', { name: 'Add new tag' }).fill(product.tags);
        await this.page.getByRole('button', { name: 'Add', exact: true }).click();

        //Set Product Image
        await this.page.getByRole('link', { name: 'Set product image' }).click();
        await this.page.waitForLoadState(3000)

        //Check if image ID is present in the product data else select the woocommerce placeholder image
        if(await this.page.locator('//li[@data-id="'+ product.imageID +'"]').isVisible())
        {
            await this.page.locator('//li[@data-id="'+ product.imageID +'"]').click();
        }
        else
        {
            await this.page.locator('//li[@aria-label="woocommerce-placeholder"]').click();
        }

        await this.page.getByRole('button', {name: 'Set product image'}).click();
        await this.page.waitForTimeout(2000)

        //Publish the product
        await this.page.getByRole('button', { name: 'Publish', exact: true }).click();
    }
}