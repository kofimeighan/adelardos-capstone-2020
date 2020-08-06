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
import com.google.sps.UserComment;
import com.google.sps.UserSubmittedLocationsPayload;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/submitted-locations")
public class UserSubmittedLocationsServlet extends HttpServlet {
  private static final String NAME_OF_PROTEST = "name";
  private static final String EMAIL = "email";
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
    response.setContentType("application/json");

    List<UserComment> userComments = new ArrayList<UserComment>();
    for (Entity entity : results.asIterable()) {
      String name = (String) entity.getProperty(NAME_OF_PROTEST);
      String email = (String) entity.getProperty(EMAIL);
      String location = (String) entity.getProperty(LOCATION);
      String description = (String) entity.getProperty(DESCRIPTION);
      long timeStamp = (long) entity.getProperty(TIME_STAMP);
      long id = entity.getKey().getId();
      UserComment userComment = new UserComment(name, email, location, description, timeStamp, id);
      userComments.add(userComment);
    }

    UserSubmittedLocationsPayload payload =
        new UserSubmittedLocationsPayload(userComments, userService.isUserLoggedIn());
    response.getWriter().println(new Gson().toJson(payload));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    // TODO(kofimeighan): use a simple if statement to check if the user is logging in with corp
    // credentials.
    if (userService.isUserLoggedIn()) {
      String name = request.getParameter(NAME_OF_PROTEST);
      String email = userService.getCurrentUser().getEmail();
      String location = request.getParameter(LOCATION);
      String description = request.getParameter(DESCRIPTION);
      long timeStamp = System.currentTimeMillis();

      Entity pinEntity = new Entity(TABLE_NAME);
      pinEntity.setProperty(NAME_OF_PROTEST, name);
      pinEntity.setProperty(EMAIL, email);
      pinEntity.setProperty(LOCATION, location);
      pinEntity.setProperty(DESCRIPTION, description);
      pinEntity.setProperty(TIME_STAMP, timeStamp);
      datastore.put(pinEntity);
    }

    // Stretch TODO(kofimeighan): Find workaround to prevent a redirect after every comment submit
    response.sendRedirect("/statistics.html");
  }
}
