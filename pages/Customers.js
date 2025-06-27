export class Customers {

    //Constructor
    constructor(page) {
        this.page = page;
    }

    //Method to create a new customer
    async createUser(user) {

        await this.page.locator('#user_login').fill(user.username);
        await this.page.locator('#email').fill(user.email);
        await this.page.locator('#pass1').clear();
        await this.page.locator('#pass1').fill(user.password);

        if(await this.page.locator('input[name="pw_weak"]').isVisible())
        {
            await this.page.locator('input[name="pw_weak"]').click();
        }

        await this.page.locator('#role').click();
        await this.page.locator('#role').selectOption(user.role);
        await this.page.locator('#createusersub').click();
    }

    //Method to perform login
    async performLogin(username, password) {

        await this.page.getByLabel('Login').click();
        await this.page.getByRole('textbox', { name: 'Username or email address' }).fill(username);
        await this.page.getByLabel('Password *').fill(password);
        await this.page.getByRole('button', { name: 'Log in' }).click();
    }

    //Method to perform logout
    async performLogout() {

        await this.page.getByRole('link', { name: 'My Account', exact: true }).click();
        await this.page.locator('a').filter({ hasText: /^Log out$/ }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    //Method to add products to the cart using the product name
    async addItemsToCart(products) {

        const items = Array.isArray(products) ? products : [products];

        await this.page.goto('/shop/');

        for(const item of items) {
            await this.page.locator('//button[@aria-label="Add to cart: “' + item + '”"]').click();
            await this.page.waitForTimeout(2000);
        }
        
    }

    //Method to proceed to checkout
    async proceedToCheckout() {

        await this.page.locator('#modal-1-content').getByRole('link', { name: 'Checkout' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    //Method to place an order using details from the passed object
    async placeOrder(shippingAddress) {

        await this.page.waitForTimeout(2000);

        if(await this.page.locator('//span[@aria-label="Edit shipping address"]').isVisible()) {
            await this.page.getByRole('button', { name: 'Place Order' }).click();
        }
        else {
            await this.page.getByLabel('Country/Region').click();
            await this.page.locator('#shipping-country').selectOption(shippingAddress.country);
            await this.page.getByRole('textbox', { name: 'First name' }).fill(shippingAddress.firstName);
            await this.page.getByRole('textbox', { name: 'Last name' }).fill(shippingAddress.lastName);
            await this.page.getByRole('textbox', { name: 'Address', exact: true }).fill(shippingAddress.address);
            await this.page.getByRole('textbox', { name: 'City' }).fill(shippingAddress.city);
            await this.page.selectOption('#shipping-state', shippingAddress.state);
            await this.page.getByRole('textbox', { name: 'PIN Code' }).fill(shippingAddress.pincode);
            await this.page.getByRole('textbox', { name: 'Phone (optional)' }).fill(shippingAddress.phone);
            const checked = await this.page.getByRole('checkbox', { name: 'Use same address for billing' }).isChecked();
            if(!checked)
            {
                await this.page.getByRole('checkbox', { name: 'Use same address for billing' }).check();
            }

            await this.page.getByRole('button', { name: 'Place Order' }).click();
        } 
    }

    //Method to delete customer
    async deleteCustomer(customerName) {

        await this.page.getByRole('link', {name: customerName}).hover;
        await this.page.locator('//a[contains(text(), ${customerName})]//ancestor::td//a[@class="submitdelete"]').click();
        await this.page.locator('#submit').click();
    }

    //Method to check if a customer is already created
    async checkUser(username) {
        
        if(await this.page.getByRole('link', { name: username, exact: true }).isVisible())
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}