package co.edu.eci.blueprints.dto;

public record ApiResponse<T>(int code, String message, T data) {}
