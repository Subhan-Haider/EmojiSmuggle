package tech.subhan.emojismuggle2.core

import android.app.Activity
import android.content.Context
import android.util.Log
import com.android.billingclient.api.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Handles Google Play Billing logic including one-time purchases and subscriptions.
 */
data class ProductInfo(
    val productId: String,
    val title: String,
    val description: String,
    val price: String,
    val productDetails: ProductDetails
)

class BillingManager(private val context: Context) : PurchasesUpdatedListener {

    private val billingClient: BillingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    private val _isPremium = MutableStateFlow(false)
    val isPremium: StateFlow<Boolean> = _isPremium.asStateFlow()

    private val _products = MutableStateFlow<List<ProductInfo>>(emptyList())
    val products: StateFlow<List<ProductInfo>> = _products.asStateFlow()

    private val _isProductsLoaded = MutableStateFlow(false)
    val isProductsLoaded: StateFlow<Boolean> = _isProductsLoaded.asStateFlow()

    private val _connectionState = MutableStateFlow(false)

    // A state to show status messages in the UI (e.g., success, error)
    private val _billingMessage = MutableStateFlow<String?>(null)
    val billingMessage: StateFlow<String?> = _billingMessage.asStateFlow()

    init {
        startConnection()
    }

    private fun startConnection() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    _connectionState.value = true
                    CoroutineScope(Dispatchers.IO).launch {
                        queryProducts()
                        restorePurchases()
                    }
                } else {
                    _billingMessage.value = "Failed to connect to Google Play."
                }
            }

            override fun onBillingServiceDisconnected() {
                _connectionState.value = false
            }
        })
    }

    private suspend fun queryProducts() {
        val inAppList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("premium_upgrade")
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )
        val subsList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("monthly_subscription")
                .setProductType(BillingClient.ProductType.SUBS)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("yearly_subscription")
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )

        val inAppParams = QueryProductDetailsParams.newBuilder().setProductList(inAppList).build()
        val subsParams = QueryProductDetailsParams.newBuilder().setProductList(subsList).build()

        val allProductDetails = mutableListOf<ProductDetails>()

        val inAppResult = withContext(Dispatchers.IO) {
            billingClient.queryProductDetails(inAppParams)
        }
        if (inAppResult.billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            inAppResult.productDetailsList?.let { allProductDetails.addAll(it) }
        }

        val subsResult = withContext(Dispatchers.IO) {
            billingClient.queryProductDetails(subsParams)
        }
        if (subsResult.billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            subsResult.productDetailsList?.let { allProductDetails.addAll(it) }
        }

        val list = allProductDetails.mapNotNull { details ->
            var price = ""
            if (details.productType == BillingClient.ProductType.INAPP) {
                price = details.oneTimePurchaseOfferDetails?.formattedPrice ?: ""
            } else if (details.productType == BillingClient.ProductType.SUBS) {
                val offer = details.subscriptionOfferDetails?.firstOrNull()
                price = offer?.pricingPhases?.pricingPhaseList?.firstOrNull()?.formattedPrice ?: ""
            }
            ProductInfo(
                productId = details.productId,
                title = details.title.replace("(Emoji Smuggle)", "").trim(),
                description = details.description,
                price = price,
                productDetails = details
            )
        }.sortedBy { it.price }
        
        _products.value = list
        _isProductsLoaded.value = true
    }

    suspend fun restorePurchases() {
        if (!_connectionState.value) return

        val inappParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()
        val inappResult = billingClient.queryPurchasesAsync(inappParams)
        
        val subsParams = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()
        val subsResult = billingClient.queryPurchasesAsync(subsParams)

        val allPurchases = mutableListOf<Purchase>()
        if (inappResult.billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            allPurchases.addAll(inappResult.purchasesList)
        }
        if (subsResult.billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            allPurchases.addAll(subsResult.purchasesList)
        }

        var isUserPremium = false
        for (purchase in allPurchases) {
            if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                if (purchase.products.any { it == "premium_upgrade" || it == "monthly_subscription" || it == "yearly_subscription" }) {
                    isUserPremium = true
                }
                if (!purchase.isAcknowledged) {
                    acknowledgePurchase(purchase)
                }
            }
        }
        _isPremium.value = isUserPremium
        if (allPurchases.isNotEmpty()) {
            _billingMessage.value = "Purchases restored successfully."
        }
    }

    fun launchPurchaseFlow(activity: Activity, productInfo: ProductInfo) {
        val productDetailsParamsList = listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder().apply {
                setProductDetails(productInfo.productDetails)
                if (productInfo.productDetails.productType == BillingClient.ProductType.SUBS) {
                    val offerToken = productInfo.productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken
                    if (offerToken != null) {
                        setOfferToken(offerToken)
                    }
                }
            }.build()
        )

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(productDetailsParamsList)
            .build()

        billingClient.launchBillingFlow(activity, billingFlowParams)
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                    _isPremium.value = true
                    _billingMessage.value = "Purchase successful! Thank you."
                    if (!purchase.isAcknowledged) {
                        CoroutineScope(Dispatchers.IO).launch {
                            acknowledgePurchase(purchase)
                        }
                    }
                }
            }
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            _billingMessage.value = "Purchase canceled."
        } else {
            _billingMessage.value = "An error occurred during purchase."
        }
    }

    private suspend fun acknowledgePurchase(purchase: Purchase) {
        val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()
        val result = withContext(Dispatchers.IO) {
            billingClient.acknowledgePurchase(acknowledgePurchaseParams)
        }
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            Log.e("Billing", "Failed to acknowledge purchase")
        }
    }

    fun clearMessage() {
        _billingMessage.value = null
    }

    fun onDestroy() {
        billingClient.endConnection()
    }
}
