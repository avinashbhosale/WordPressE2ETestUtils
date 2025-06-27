import {test, expect} from '@wordpress/e2e-test-utils-playwright'
import { Customers } from '../pages/Customers';

//Create customer details json object from customer test data
const customer = require('../testdata/customer.json');
const shopManager = require('../testdata/shopmanager.json');

test('Create a new customer', async({page, admin}) => {

    //Create customer page object
    const customerPage = new Customers(page);

    //Check if the customer is already present
    await admin.visitAdminPage('users.php');
    
    if(await customerPage.checkUser(customer.username))
    {
        console.log("Customer is already created!. Skipping this test..")
        test.skip();
    }

    //Visit new user page
    await admin.visitAdminPage('user-new.php');
    await customerPage.createUser(customer);

    //Assertion for new user created message
    await expect(page.locator('#message > p')).toHaveText('New user created. Edit user')
    await expect(page.getByRole('link', { name: customer.username, exact: true })).toBeVisible();

})

test('Create a new shop manager', async({page, admin}) => {

    //Create customer page object
    const customerPage = new Customers(page);

    //Check if the manager is already present
    await admin.visitAdminPage('users.php');
    
    if(await customerPage.checkUser(shopManager.username))
    {
        console.log("Shop Manager is already created!. Skipping this test..")
        test.skip();
    }

    //Visit new user page
    await admin.visitAdminPage('user-new.php');
    await customerPage.createUser(shopManager);

    //Assertion for new user created message
    await expect(page.locator('#message > p')).toHaveText('New user created. Edit user')
    await expect(page.getByRole('link', { name: shopManager.username, exact: true })).toBeVisible();

})

test.only("Place an order and review the order", async( {page, admin} ) => {
    //Create customer page object
    const customerPage = new Customers(page);

    await admin.visitAdminPage('users.php');
    
    //Check if the customer is already present
    if(await customerPage.checkUser(customer.username))
    {
        console.log("Customer is already created!. Skipping this test..")
    }
    else {
        //Create a new user
        await admin.visitAdminPage('user-new.php');
        await customerPage.createUser(customer);
    }

    await admin.visitAdminPage('users.php');

    //Check if the manager is already present
    if(await customerPage.checkUser(shopManager.username))
    {
        console.log("Manager is already created!. Skipping this test..")
    }
    else {
        //Create a new user
        await admin.visitAdminPage('user-new.php');
        await customerPage.createUser(shopManager);
    }
    
    //Go to My account page
    await page.goto('/my-account/');

    //Check if the any user is already logged in, if Yes then logout
    if(await page.locator('//p/a[contains(text(), "Log out")]').isVisible())
    {
        await page.locator('//p/a[contains(text(), "Log out")]').click();
    }

    //Login as a customer
    await customerPage.performLogin(customer.username, customer.password)

    //Create array for items to be added to the cart
    const products = ["Black and White", "Hi-Fi Headphones"];

    //Add itesm to the card
    await customerPage.addItemsToCart(products);

    //Proceed to checkout
    await customerPage.proceedToCheckout();

    //Proceed to place order
    await customerPage.placeOrder(customer);

    //Wait for the page to load
    await page.waitForLoadState('load');

    //Assert for order confirmation
    await expect(page.locator('div.wp-block-woocommerce-order-confirmation-status')).toBeVisible();
    await expect(page.locator('div.wp-block-woocommerce-order-confirmation-status p')).toContainText('Thank you. Your order has been received.');

    //Get the order ID
    const orderID = await page.locator('//span[contains(., "Order #:")]/following-sibling::span').innerText();

    //Logout
    await customerPage.performLogout();

    //Login as a manager
    await customerPage.performLogin(shopManager.username, shopManager.password);

    await page.goto('/wp-admin/admin.php?page=wc-orders');

    //Assert for the order ID
    await expect(page.locator('//a[contains(., "' + orderID + '")]')).toBeVisible();

    //Go to the oder
    await page.locator('//a[contains(., "' + orderID + '")]').click();

    //MArk the order status as completed
    await page.selectOption('#order_status', 'Completed');
    await page.locator('//button[@value="Update"]').click();

    //Assert that the oder status is updated successfully
    await expect(page.locator('div.notice-success p')).toContainText('Order updated.');
})