package com.example.app.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class TodoRequest {
    @NotBlank(message = "标题不能为空")
    private String title;
    
    private String description;
    
    private LocalDate dueDate;

    public TodoRequest() {
    }

    public TodoRequest(String title, String description, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public static TodoRequestBuilder builder() {
        return new TodoRequestBuilder();
    }

    public static class TodoRequestBuilder {
        private String title;
        private String description;
        private LocalDate dueDate;
        
        public TodoRequestBuilder title(String title) {
            this.title = title;
            return this;
        }
        
        public TodoRequestBuilder description(String description) {
            this.description = description;
            return this;
        }
        
        public TodoRequestBuilder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }
        
        public TodoRequest build() {
            return new TodoRequest(title, description, dueDate);
        }
    }
}
