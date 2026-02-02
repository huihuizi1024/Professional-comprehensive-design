package com.express.cabinet.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank(message = "手机号或用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;
}
