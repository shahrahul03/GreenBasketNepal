package com.greenbasket.nepal.email.service.impl;

import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderItem;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.email.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final ResourceLoader resourceLoader;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.admin-email}")
    private String adminEmail;

    @Value("${app.email.frontend-url}")
    private String frontendUrl;

    @Override
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(User user) {
        sendHtmlEmail(
                user.getEmail(),
                "Welcome to Green Basket Nepal – Start Exploring Fresh Produce!",
                buildWelcomeTemplate(user)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendOrderConfirmation(Order order) {
        sendHtmlEmail(
                order.getUser().getEmail(),
                "Order Confirmed – " + order.getOrderNumber(),
                buildOrderConfirmationTemplate(order)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendOrderDelivered(Order order) {
        sendHtmlEmail(
                order.getUser().getEmail(),
                "Your Order Has Been Delivered – " + order.getOrderNumber(),
                buildOrderDeliveredTemplate(order)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendOrderCancelled(Order order) {
        sendHtmlEmail(
                order.getUser().getEmail(),
                "Order Cancelled – " + order.getOrderNumber(),
                buildOrderCancelledTemplate(order)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendFarmerApproved(User farmer) {
        sendHtmlEmail(
                farmer.getEmail(),
                "Your Farmer Account Has Been Approved!",
                buildFarmerApprovedTemplate(farmer)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendFarmerRejected(User farmer) {
        sendHtmlEmail(
                farmer.getEmail(),
                "Update on Your Farmer Registration",
                buildFarmerRejectedTemplate(farmer)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendFarmerRegistrationAlert(User farmer) {
        sendHtmlEmail(
                adminEmail,
                "New Farmer Registration – " + farmer.getFullName(),
                buildFarmerRegistrationAlertTemplate(farmer)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendNewOrderToFarmers(Order order) {
        Set<Long> sellerIds = new HashSet<>();
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findById(item.getProductId())
                        .map(Product::getSeller)
                        .map(User::getId)
                        .ifPresent(sellerIds::add);
            }
        }

        for (Long sellerId : sellerIds) {
            userRepository.findById(sellerId).ifPresent(seller -> {
                List<OrderItem> farmerItems = order.getItems().stream()
                        .filter(item -> item.getProductId() != null)
                        .filter(item -> productRepository.findById(item.getProductId())
                                .map(p -> p.getSeller().getId().equals(sellerId))
                                .orElse(false))
                        .toList();
                sendHtmlEmail(
                        seller.getEmail(),
                        "New Order Received – " + order.getOrderNumber(),
                        buildNewOrderForFarmerTemplate(seller, order, farmerItems)
                );
            });
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendDeliveryAssignedToPartner(Order order, User partner) {
        sendHtmlEmail(
                partner.getEmail(),
                "New Delivery Assignment – " + order.getOrderNumber(),
                buildDeliveryAssignedPartnerTemplate(order, partner)
        );
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendDeliveryAssignedToCustomer(Order order, User partner) {
        sendHtmlEmail(
                order.getUser().getEmail(),
                "Your Order is Out for Delivery – " + order.getOrderNumber(),
                buildDeliveryAssignedCustomerTemplate(order, partner)
        );
    }

    // ──────────────────────────────────────────────
    //  Internal helpers
    // ──────────────────────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to: {} — subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to: {} — subject: {} — error: {}", to, subject, e.getMessage());
        }
    }

    private String loadTemplate(String name) {
        try {
            InputStream is = resourceLoader.getResource("classpath:templates/email/" + name).getInputStream();
            return new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))
                    .lines()
                    .collect(Collectors.joining("\n"));
        } catch (IOException e) {
            log.error("Failed to load email template: {}", name, e);
            return "<html><body><p>Failed to load template</p></body></html>";
        }
    }

    private String fill(String template, String key, String value) {
        return template.replace("{{" + key + "}}", value != null ? value : "");
    }

    private String fillAll(String template, java.util.Map<String, String> values) {
        String result = template;
        for (var entry : values.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }

    private String buildWelcomeTemplate(User user) {
        String tpl = loadTemplate("welcome.html");
        return fillAll(tpl, java.util.Map.of(
                "name", user.getFullName(),
                "email", user.getEmail(),
                "loginUrl", frontendUrl + "/login",
                "frontendUrl", frontendUrl,
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildOrderConfirmationTemplate(Order order) {
        String tpl = loadTemplate("order-confirmation.html");
        String itemsHtml = buildOrderItemsHtml(order.getItems());
        return fillAll(tpl, java.util.Map.ofEntries(
                java.util.Map.entry("name", order.getUser().getFullName()),
                java.util.Map.entry("orderNumber", order.getOrderNumber()),
                java.util.Map.entry("orderDate", order.getPlacedAt() != null ? order.getPlacedAt().toString().replace("T", " ") : ""),
                java.util.Map.entry("items", itemsHtml),
                java.util.Map.entry("subtotal", formatPrice(order.getSubtotal())),
                java.util.Map.entry("deliveryCharge", formatPrice(order.getDeliveryCharge())),
                java.util.Map.entry("total", formatPrice(order.getTotal())),
                java.util.Map.entry("deliveryAddress", order.getDeliveryAddress() != null ? order.getDeliveryAddress() : ""),
                java.util.Map.entry("frontendUrl", frontendUrl),
                java.util.Map.entry("ordersUrl", frontendUrl + "/orders/" + order.getId()),
                java.util.Map.entry("currentYear", String.valueOf(java.time.Year.now()))
        ));
    }

    private String buildOrderDeliveredTemplate(Order order) {
        String tpl = loadTemplate("order-delivered.html");
        return fillAll(tpl, java.util.Map.of(
                "name", order.getUser().getFullName(),
                "orderNumber", order.getOrderNumber(),
                "deliveredAt", order.getDeliveredAt() != null ? order.getDeliveredAt().toString().replace("T", " ") : "",
                "total", formatPrice(order.getTotal()),
                "frontendUrl", frontendUrl,
                "ordersUrl", frontendUrl + "/orders/" + order.getId(),
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildOrderCancelledTemplate(Order order) {
        String tpl = loadTemplate("order-cancelled.html");
        return fillAll(tpl, java.util.Map.of(
                "name", order.getUser().getFullName(),
                "orderNumber", order.getOrderNumber(),
                "reason", order.getCancellationReason() != null ? order.getCancellationReason() : "No reason provided",
                "total", formatPrice(order.getTotal()),
                "frontendUrl", frontendUrl,
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildFarmerApprovedTemplate(User farmer) {
        String tpl = loadTemplate("farmer-approved.html");
        return fillAll(tpl, java.util.Map.of(
                "name", farmer.getFullName(),
                "loginUrl", frontendUrl + "/login",
                "dashboardUrl", frontendUrl + "/farmer",
                "frontendUrl", frontendUrl,
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildFarmerRejectedTemplate(User farmer) {
        String tpl = loadTemplate("farmer-rejected.html");
        return fillAll(tpl, java.util.Map.of(
                "name", farmer.getFullName(),
                "frontendUrl", frontendUrl,
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildFarmerRegistrationAlertTemplate(User farmer) {
        String tpl = loadTemplate("farmer-registration-admin.html");
        return fillAll(tpl, java.util.Map.of(
                "farmerName", farmer.getFullName(),
                "farmerEmail", farmer.getEmail(),
                "farmerPhone", farmer.getPhone() != null ? farmer.getPhone() : "N/A",
                "adminUrl", frontendUrl + "/admin/farmers",
                "frontendUrl", frontendUrl,
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildNewOrderForFarmerTemplate(User farmer, Order order, List<OrderItem> items) {
        String tpl = loadTemplate("new-order-farmer.html");
        String itemsHtml = buildFarmerOrderItemsHtml(items);
        BigDecimal farmerTotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return fillAll(tpl, java.util.Map.of(
                "name", farmer.getFullName(),
                "orderNumber", order.getOrderNumber(),
                "customerName", order.getUser().getFullName(),
                "customerAddress", order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "",
                "customerPhone", order.getPhone() != null ? order.getPhone() : "",
                "items", itemsHtml,
                "total", formatPrice(farmerTotal),
                "frontendUrl", frontendUrl,
                "ordersUrl", frontendUrl + "/farmer/orders",
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildDeliveryAssignedPartnerTemplate(Order order, User partner) {
        String tpl = loadTemplate("delivery-assigned-partner.html");
        return fillAll(tpl, java.util.Map.of(
                "name", partner.getFullName(),
                "orderNumber", order.getOrderNumber(),
                "customerName", order.getUser().getFullName(),
                "customerAddress", order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "",
                "customerPhone", order.getPhone() != null ? order.getPhone() : "",
                "total", formatPrice(order.getTotal()),
                "frontendUrl", frontendUrl,
                "deliveriesUrl", frontendUrl + "/deliveries",
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildDeliveryAssignedCustomerTemplate(Order order, User partner) {
        String tpl = loadTemplate("delivery-assigned-customer.html");
        return fillAll(tpl, java.util.Map.of(
                "name", order.getUser().getFullName(),
                "orderNumber", order.getOrderNumber(),
                "partnerName", partner.getFullName(),
                "partnerPhone", partner.getPhone() != null ? partner.getPhone() : "N/A",
                "frontendUrl", frontendUrl,
                "ordersUrl", frontendUrl + "/orders/" + order.getId(),
                "currentYear", String.valueOf(java.time.Year.now())
        ));
    }

    private String buildOrderItemsHtml(List<OrderItem> items) {
        StringBuilder sb = new StringBuilder();
        for (OrderItem item : items) {
            sb.append("<tr style=\"border-bottom:1px solid #e2e8f0;\">")
              .append("<td style=\"padding:12px 8px;color:#1e293b;font-size:14px;\">")
              .append(escapeHtml(item.getProductName())).append("</td>")
              .append("<td style=\"padding:12px 8px;color:#64748b;font-size:14px;text-align:center;\">")
              .append(item.getQuantity()).append(" × ").append(escapeHtml(item.getUnit())).append("</td>")
              .append("<td style=\"padding:12px 8px;color:#1e293b;font-size:14px;text-align:right;\">")
              .append(formatPrice(item.getUnitPrice())).append("</td>")
              .append("<td style=\"padding:12px 8px;color:#059669;font-size:14px;font-weight:600;text-align:right;\">")
              .append(formatPrice(item.getSubtotal())).append("</td>")
              .append("</tr>");
        }
        return sb.toString();
    }

    private String buildFarmerOrderItemsHtml(List<OrderItem> items) {
        StringBuilder sb = new StringBuilder();
        for (OrderItem item : items) {
            sb.append("<tr style=\"border-bottom:1px solid #e2e8f0;\">")
              .append("<td style=\"padding:12px 8px;color:#1e293b;font-size:14px;\">")
              .append(escapeHtml(item.getProductName())).append("</td>")
              .append("<td style=\"padding:12px 8px;color:#64748b;font-size:14px;text-align:center;\">")
              .append(item.getQuantity()).append(" × ").append(escapeHtml(item.getUnit())).append("</td>")
              .append("<td style=\"padding:12px 8px;color:#059669;font-size:14px;font-weight:600;text-align:right;\">")
              .append(formatPrice(item.getSubtotal())).append("</td>")
              .append("</tr>");
        }
        return sb.toString();
    }

    private String formatPrice(BigDecimal amount) {
        if (amount == null) return "Rs. 0.00";
        return "Rs. " + String.format("%,.2f", amount);
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
