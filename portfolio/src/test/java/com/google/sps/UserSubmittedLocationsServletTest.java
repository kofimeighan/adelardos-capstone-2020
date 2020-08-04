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

package com.google.sps;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import com.google.appengine.tools.development.testing.LocalUserServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.sps.servlets.UserSubmittedLocationsServlet;
import com.google.sps.UserComment;
import java.io.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;


/**
  Tests the Login/Logout URL's of the LoginServlet
*/
@RunWith(JUnit4.class)
public final class UserSubmittedLocationsServletTest {
  @InjectMocks private UserSubmittedLocationsServlet userSubmittedLocationsServlet = new UserSubmittedLocationsServlet();

  @Mock private HttpServletRequest request;

  @Mock private HttpServletResponse response;

  private final LocalServiceTestHelper helper = new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig(), new LocalUserServiceTestConfig());
  private static final String TEST_NAME = "Tayla";
  private static final String TEST_PROTEST_NAME = "Protest in Miami!";
  private static final String TEST_EMAIL = "test@google.com";
  private static final String TEST_LOCATION = "Miami, FL";
  private static final String TEST_DESCRIPTION = "Protesting Police Brutality";
  private static final long TEST_TIME_STAMP = 1111111;
  private static final String NAME_OF_PROTEST = "name";
  private static final String EMAIL = "email";
  private static final String LOCATION = "location";
  private static final String DESCRIPTION = "description";
  private static final String TIME_STAMP = "timestamp";
  private static final String ID = "id";
  private static final String TABLE_NAME = "Pins";


  @Before
  public void setUp() throws Exception {
    MockitoAnnotations.initMocks(this);
    helper.setUp();
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  @Test
  public void storesCorrectEntity() throws Exception {
      helper.setEnvIsLoggedIn(true).setEnvEmail(TEST_EMAIL).setEnvAuthDomain("localhost");
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

      Entity testEntity = new Entity(TABLE_NAME);
      testEntity.setProperty(NAME_OF_PROTEST, TEST_PROTEST_NAME);
      testEntity.setProperty(EMAIL, TEST_EMAIL);
      testEntity.setProperty(LOCATION, TEST_LOCATION);
      testEntity.setProperty(DESCRIPTION, TEST_DESCRIPTION);
      testEntity.setProperty(TIME_STAMP, TEST_TIME_STAMP);
      datastore.put(testEntity);

      when(request.getParameter(NAME_OF_PROTEST)).thenReturn(TEST_PROTEST_NAME);
      when(request.getParameter(EMAIL)).thenReturn(TEST_EMAIL);
      when(request.getParameter(LOCATION)).thenReturn(TEST_LOCATION);
      when(request.getParameter(DESCRIPTION)).thenReturn(TEST_DESCRIPTION);
      when(request.getParameter(TIME_STAMP)).thenReturn(TEST_TIME_STAMP);

      StringWriter stringWriter = new StringWriter();
      PrintWriter printWriter = new PrintWriter();
      
      userSubmittedLocationsServlet.doPost(request, response);

      Query query = new Query(TABLE_NAME);
      PreparedQuery results = datastore.prepare(query);
      Entity desiredEntity = preparedQuery.asSingleEntity();

      verify(response, time(1));
  }
}
