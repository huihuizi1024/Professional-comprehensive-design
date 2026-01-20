package com.express.cabinet.dto;

import lombok.Data;

import javax.validation.constraints.Pattern;

@Data
public class UpdateUserRequest {
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    private String realName;

    private String password;

    private Integer userType;

    private Integer status;
}
