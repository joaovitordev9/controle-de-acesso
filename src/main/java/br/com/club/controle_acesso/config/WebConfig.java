package br.com.club.controle_acesso.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Quem pode chamar a API a partir de uma página web (CORS).
 *
 * - O app desktop (Electron) carrega a tela de arquivo local e NÃO envia o cabeçalho
 *   Origin, então não depende desta lista: funciona em qualquer PC da rede.
 * - Liberamos só as origens locais usadas no desenvolvimento (npm run dev).
 * - Qualquer outro site aberto num navegador da rede é bloqueado, para que uma página
 *   maliciosa não consiga ler ou apagar dados do clube pela API.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:[*]", "http://127.0.0.1:[*]")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
