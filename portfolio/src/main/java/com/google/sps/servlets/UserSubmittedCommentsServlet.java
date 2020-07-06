// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/submitted-comments")
public class UserSubmittedCommentsServlet extends HttpServlet {
  private static final String NAME = "name";
  private static final String PHONE = "phone";
  private static final String LOCATION = "location";
  private static final String DESCRIPTION = "description";
  private static final String TABLE_NAME = "Pins";
  private static final String TIME_STAMP = "timestamp";
  private static final String ID = "id";

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    Query query = new Query(TABLE_NAME);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<UserComment> userComments = new ArrayList<UserComment>();
    for (Entity entity : results.asIterable()) {
      String name = (String) entity.getProperty(NAME);
      String phone = (String) entity.getProperty(PHONE);
      String location = (String) entity.getProperty(LOCATION);
      String description = (String) entity.getProperty(DESCRIPTION);
      long timeStamp = (long) entity.getProperty(TIME_STAMP);
      long id = entity.getKey().getId();

      UserComment userComment = new UserComment(name, phone, location, description, timeStamp, id);
      userComments.add(userComment);
    }

    response.setContentType("application/json");
    response.getWriter().println(new Gson().toJson(userComments));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    String name = request.getParameter(NAME);
    String phone = request.getParameter(PHONE);
    String location = request.getParameter(LOCATION);
    String description = request.getParameter(DESCRIPTION);
    long timeStamp = System.currentTimeMillis();

    Entity pinEntity = new Entity(TABLE_NAME);
    pinEntity.setProperty(NAME, name);
    pinEntity.setProperty(PHONE, phone);
    pinEntity.setProperty(LOCATION, location);
    pinEntity.setProperty(DESCRIPTION, description);
    pinEntity.setProperty(TIME_STAMP, timeStamp);
    datastore.put(pinEntity);

    response.sendRedirect("/statistics.html");
  }
}
