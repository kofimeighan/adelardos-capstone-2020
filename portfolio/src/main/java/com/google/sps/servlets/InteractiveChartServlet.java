package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet for the interactive pie chart */
@WebServlet("/interactive-chart")
public class InteractiveChartServlet extends HttpServlet {
  private Map<String, Integer> emotionVotes = new HashMap<>();
  private static String EMOTION_DATA = "emotion";
  private static String VOTES = "Votes";
  private static String TIMESTAMP = "timestamp";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query votesQuery = new Query(VOTES);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(votesQuery);

    String votesJSON = new Gson().toJson(emotionVotes);
    response.setContentType("application/json");
    response.getWriter().println(votesJSON);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String emotion = request.getParameter(EMOTION_DATA);
    int currentVotes = emotionVotes.containsKey(emotion) ? emotionVotes.get(emotion) : 0;
    emotionVotes.put(emotion, currentVotes + 1);
    long timestamp = System.currentTimeMillis();

    // Stores object in datastore entity
    Entity TABLE_NAME = new Entity(VOTES);
    TABLE_NAME.setProperty(EMOTION_DATA, emotion);
    TABLE_NAME.setProperty(TIMESTAMP, timestamp);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(TABLE_NAME);

    // TODO Stretch Feature(briafassler): Find a way to prevent redirecting when submitting votes
    response.sendRedirect("/statistics.html#chart-container");
  }

  private String getParameter(HttpServletRequest request, String emotion, String defaultValue) {
    String value = request.getParameter(emotion);
    return value;
  }
}
