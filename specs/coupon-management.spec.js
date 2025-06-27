import {test, expect} from '@wordpress/e2e-test-utils-playwright'
import {Coupons} from '../pages/Coupons'
import {Customers} from '../pages/Customers'

//Create coupon json object from the coupon test data
const couponDetails = require('../testdata/coupon.json');

test('Create a new coupon', async({ page, admin }) => {

    //Create a coupons page object
    const couponPage = new Coupons(page);

    await admin.visitAdminPage('/');

    //Visit coupons page
    await page.goto('/wp-admin/edit.php?post_type=shop_coupon&legacy_coupon_menu=1/');

    //Check if the coupon is already created
    if(await page.getByRole('link', { name: couponDetails.code, exact: true }).isVisible());
    {
        console.log("This coupon is already created. Skipping the test..");
        test.skip();
    }

    await admin.createNewPost( {postType: "shop_coupon" });
    await couponPage.createCoupon(couponDetails);

    //Assert for coupon updated message
    await expect(page.locator('div.notice-success p')).toContainText('Coupon updated');
})

test('Apply a coupon and verify discount prices', async({ page, admin }) => {

    //Create necessary objects
    const couponPage = new Coupons(page);
    const customerPage = new Customers(page);
    const products = ["Black and White", "Hi-Fi Headphones"];
    const customer = require('../testdata/customer.json');

    //Check if the customer is already present
    await admin.visitAdminPage('users.php');
    if(await customerPage.checkUser(customer.username))
    {
        console.log("Customer is already created!. Skipping this test..")
    }
    else {
        customerPage.createUser(customer);
    }

    //Visit my account page
    await page.goto('/my-account/');

    //Check if the any user is already logged in, if Yes then logout
    if(await page.locator('//p/a[contains(text(), "Log out")]').isVisible())
    {
        await page.locator('//p/a[contains(text(), "Log out")]').click();
    }

    //Login as a customer
    await customerPage.performLogin(customer.username, customer.password)

    //Go to Shop and add products to the cart
    await page.goto('/shop/');
    await page.waitForLoadState('domcontentloaded');
    await customerPage.addItemsToCart(products);

    //Proceed to checkout and apply coupon
    await customerPage.proceedToCheckout();

    //Apply coupon code
    await couponPage.applyCoupon(couponDetails.code);

    //Assert to check if the discount is applied
    await expect(page.locator('li.wc-block-components-totals-discount__coupon-list-item')).toBeVisible();

    //Fetch the actual discount amount displayed
    let acutalDiscountAmountStr = await page.locator('//span[contains(text(), "Discount")]/following-sibling::span').innerText();
    let actualDiscountAmount = Math.abs(parseFloat(acutalDiscountAmountStr.replace(/[^0-9.-]/g, '')));
    console.log("Actual discount amount displayed: " + actualDiscountAmount);

    //Get the expected discount amount from the helper function
    const expectedDiscountAmount = await couponPage.calculateExpectedDiscount(couponDetails);
    console.log("Expected Discount Amount: " + expectedDiscountAmount);

    //Assert for coupon discount amount
    expect(actualDiscountAmount).toEqual(expectedDiscountAmount);
})
