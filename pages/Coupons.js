export class Coupons {

    //Constructor
    constructor(page)
    {
        this.page = page;
    }

    //Method to create new coupon
    async createCoupon(coupon) {

        await this.page.getByRole('textbox', { name: 'Coupon code' }).fill(coupon.code);
        await this.page.getByRole('textbox', { name: 'Description (optional)' }).fill(coupon.description);
        await this.page.getByLabel('Discount type').click();
        await this.page.locator('#discount_type').selectOption(coupon.type);
        await this.page.getByRole('textbox', { name: 'Coupon amount' }).fill(String(coupon.amount));
        await this.page.getByRole('checkbox', { name: 'Allow free shipping' }).check();
        await this.page.getByRole('textbox', { name: 'Coupon expiry date' }).fill(coupon.expiry);
        await this.page.locator('//h2[contains(text(), "Channel visibility")]').click();
        await this.page.waitForTimeout(2000);
        await this.page.getByRole('button', { name: 'Publish', exact: true }).click();
    }

    //Method to go apply a coupon
    async applyCoupon(couponCode) {

        //Check if the coupon is already applied
        if(await this.page.locator('//span[contains(., "' + couponCode + '")]').first().isVisible()) {
            console.log("This coupon code is already applied")
        }
        else {
            await this.page.getByRole('button', { name: 'Add a coupon' }).click();
            await this.page.getByLabel('Enter code').fill(couponCode);
            await this.page.getByRole('button', { name: 'Apply' }).click();
        }
        
    }

    //Method to calculate expected coupon discount amount on checkout page based of discount type and return the calculated amount
    async calculateExpectedDiscount(coupon) {
        
        const itemQuantities = await this.page.locator('div.wc-block-components-order-summary-item__quantity');
        const subtotalAmountStr = await this.page.locator('//span[contains(text(), "Subtotal")]/following-sibling::span').textContent();
        const subtotalAmount = Math.abs(parseFloat(subtotalAmountStr.replace(/[^0-9.-]/g, '')));

        //Calculate discount based on coupon type
        if(coupon.type == 'Fixed product discount') {
            let totalItemsCount = 0;

            for(let i = 0; i < await itemQuantities.count(); i++) { 
                const item = await itemQuantities.nth(i).locator('span').first();
                totalItemsCount += parseInt(await item.innerText());
            }

            return (coupon.amount * totalItemsCount);
        }
        else if(coupon.type == 'Percentage discount') {
            return ( (subtotalAmount * coupon.amount) / 100 );
        }
        else
        {
            return coupon.amount;
        }
    }
}