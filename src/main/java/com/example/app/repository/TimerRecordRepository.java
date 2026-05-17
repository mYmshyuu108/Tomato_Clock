package com.example.app.repository;

import com.example.app.entity.TimerRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimerRecordRepository extends JpaRepository<TimerRecord, Long> {
    List<TimerRecord> findByUserIdAndDate(Long userId, LocalDate date);
    List<TimerRecord> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<TimerRecord> findByUserIdOrderByDateDesc(Long userId);
    
    @Query("SELECT tr.date, SUM(tr.duration) FROM TimerRecord tr WHERE tr.user.id = :userId GROUP BY tr.date ORDER BY tr.date DESC")
    List<Object[]> getDailyMinutesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT SUM(tr.duration) FROM TimerRecord tr WHERE tr.user.id = :userId AND tr.date = :date")
    Integer sumDurationByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT SUM(tr.duration) FROM TimerRecord tr WHERE tr.user.id = :userId AND tr.date BETWEEN :startDate AND :endDate")
    Integer sumDurationByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(tr) FROM TimerRecord tr WHERE tr.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(DISTINCT tr.date) FROM TimerRecord tr WHERE tr.user.id = :userId")
    Long countDistinctDatesByUserId(@Param("userId") Long userId);
}