package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** TODO(briafassler): store data to a database */
@WebServlet("/interactive-chart")
public class InteractiveChartServlet extends HttpServlet {
  private Map<String, Integer> emotionVotes = new HashMap<>();
  private static String emotionData = "emotion";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    Gson gson = new Gson();
    String json = gson.toJson(emotionVotes);
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String emotion = request.getParameter(emotionData);
    int currentVotes = emotionVotes.containsKey(emotion) ? emotionVotes.get(emotion) : 0;
    emotionVotes.put(emotion, currentVotes + 1);

    response.sendRedirect("/statistics.html");
  }
}