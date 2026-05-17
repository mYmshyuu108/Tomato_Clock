package com.example.app.repository;

import com.example.app.entity.DailyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StatsRepository extends JpaRepository<DailyStats, Long> {
    Optional<DailyStats> findByUserIdAndDate(Long userId, LocalDate date);
    List<DailyStats> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate startDate, LocalDate endDate);
    List<DailyStats> findByUserIdOrderByDateDesc(Long userId);
    
    @Query("SELECT SUM(ds.totalMinutes) FROM DailyStats ds WHERE ds.user.id = :userId AND ds.date BETWEEN :startDate AND :endDate")
    Integer sumTotalMinutesByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT MAX(ds.date) FROM DailyStats ds WHERE ds.user.id = :userId")
    LocalDate findLatestDateByUserId(@Param("userId") Long userId);
}